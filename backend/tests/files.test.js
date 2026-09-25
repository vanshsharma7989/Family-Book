require('./setup');
const request = require('supertest');
const path = require('path');
const app = require('../src/app');

async function registerAndLogin(agentEmail) {
  const agent = request.agent(app);
  await agent
    .post('/api/auth/register')
    .send({ name: 'User', email: agentEmail, password: 'Password1' });
  await agent.post('/api/auth/login').send({ email: agentEmail, password: 'Password1' });
  return agent;
}

describe('File upload, download, and authorization', () => {
  test('authenticated user can upload and list a file', async () => {
    const agent = await registerAndLogin('uploader@example.com');

    const res = await agent
      .post('/api/files/upload')
      .field('category', 'photo')
      .attach('files', Buffer.from('fake-image-bytes'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.uploaded.length).toBe(1);

    const listRes = await agent.get('/api/files');
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.files.length).toBe(1);
  });

  test('rejects disallowed file types', async () => {
    const agent = await registerAndLogin('rejecter@example.com');
    const res = await agent
      .post('/api/files/upload')
      .attach('files', Buffer.from('bad'), {
        filename: 'malware.exe',
        contentType: 'application/x-msdownload',
      });
    expect(res.status).toBe(400);
  });

  test('User A cannot access User B files (IDOR protection)', async () => {
    const agentA = await registerAndLogin('userA@example.com');
    const agentB = await registerAndLogin('userB@example.com');

    const uploadRes = await agentA
      .post('/api/files/upload')
      .attach('files', Buffer.from('private-data'), {
        filename: 'secret.jpg',
        contentType: 'image/jpeg',
      });

    const fileId = uploadRes.body.data.uploaded[0]._id;

    const downloadAttempt = await agentB.get(`/api/files/${fileId}/download`);
    expect(downloadAttempt.status).toBe(404);

    const deleteAttempt = await agentB.delete(`/api/files/${fileId}`);
    expect(deleteAttempt.status).toBe(404);
  });

  test('unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/files');
    expect(res.status).toBe(401);
  });

  test('delete moves file to trash, then can be restored', async () => {
    const agent = await registerAndLogin('trasher@example.com');
    const uploadRes = await agent
      .post('/api/files/upload')
      .attach('files', Buffer.from('data'), { filename: 'a.pdf', contentType: 'application/pdf' });
    const fileId = uploadRes.body.data.uploaded[0]._id;

    const delRes = await agent.delete(`/api/files/${fileId}`);
    expect(delRes.status).toBe(200);

    const trashRes = await agent.get('/api/trash');
    expect(trashRes.body.data.files.length).toBe(1);

    const restoreRes = await agent.patch(`/api/trash/${fileId}/restore`);
    expect(restoreRes.status).toBe(200);

    const listRes = await agent.get('/api/files');
    expect(listRes.body.data.files.length).toBe(1);
  });
});
