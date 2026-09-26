import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Files,
  Image,
  FileText,
  File,
  HardDrive,
  Upload as UploadIcon,
  Star,
  ChevronRight,
  Settings,
  Plus,
} from 'lucide-react';

import api from '../api/axios';

import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Footer from '../components/Footer';

import {
  formatBytes,
  formatDate,
} from '../utils/format';

import { useAuth } from '../context/AuthContext';


// =====================================================
// DASHBOARD
// =====================================================

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);


  // ===================================================
  // LOAD STATS
  // ===================================================

  useEffect(() => {
    api
      .get('/files/stats')
      .then((res) => {
        setStats(res.data.data);
      })
      .catch((error) => {
        console.error(
          'Failed to load dashboard:',
          error
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }


  // ===================================================
  // SAFETY
  // ===================================================

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Unable to load dashboard.
      </div>
    );
  }


  const firstName =
    user?.name?.split(' ')[0] ||
    'User';


  // ===================================================
  // MOBILE CATEGORY DATA
  // ===================================================

  const mobileCategories = [
    {
      title: 'Photos',
      count: stats.totalPhotos,
      icon: Image,
      to: '/photos',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-500',
    },

    {
      title: 'PDFs',
      count: stats.totalPdfs,
      icon: File,
      to: '/pdfs',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },

    {
      title: 'Documents',
      count: stats.totalDocuments,
      icon: FileText,
      to: '/documents',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-500',
    },

    {
      title: 'Favorites',
      count: stats.favoritesCount,
      icon: Star,
      to: '/favorites',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
    },
  ];


  // ===================================================
  // MOBILE UI
  // ===================================================

  const MobileDashboard = () => (
    <div
      className="
        min-h-screen
        bg-slate-50
        pb-24
        lg:hidden
      "
    >

      {/* =============================================
          MOBILE HEADER
      ============================================= */}

      <div
        className="
          sticky
          top-0
          z-30
          -mx-4
          flex
          items-center
          justify-between
          border-b
          border-slate-200
          bg-white/95
          px-4
          py-3
          backdrop-blur
        "
      >

        {/* LOGO */}

        <div className="flex items-center gap-2">

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-brand-500
              text-white
            "
          >
            <HardDrive className="h-5 w-5" />
          </div>

          <div>
            <p className="text-base font-bold leading-none">
              Family
              <span className="text-brand-500">
                {' '}Book
              </span>
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Personal file vault
            </p>
          </div>

        </div>


        {/* SETTINGS */}

        <Link
          to="/settings"
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-slate-100
            text-slate-600
            hover:bg-slate-200
          "
        >
          <Settings className="h-4 w-4" />
        </Link>

      </div>


      {/* =============================================
          WELCOME
      ============================================= */}

      <div className="pt-6">

        <h1
          className="
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
          "
        >
          Hello {firstName} 👋
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Your personal file vault
        </p>

      </div>


      {/* =============================================
          STORAGE CARD
      ============================================= */}

      <div
        className="
          mt-5
          overflow-hidden
          rounded-2xl
          border
          border-blue-100
          bg-gradient-to-br
          from-blue-50
          to-white
          p-4
          shadow-sm
        "
      >

        <div className="flex items-center gap-4">

          {/* ICON */}

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-blue-100
              text-blue-500
            "
          >
            <HardDrive className="h-6 w-6" />
          </div>


          {/* TEXT */}

          <div className="min-w-0 flex-1">

            <p className="text-xs font-medium text-slate-500">
              Storage Used
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatBytes(stats.storageUsed)}
            </p>

          </div>

        </div>


        <div className="mt-4">

          <div className="h-2 overflow-hidden rounded-full bg-blue-100">

            <div
              className="
                h-full
                rounded-full
                bg-brand-500
              "
              style={{
                width:
                  stats.storageUsed > 0
                    ? '35%'
                    : '0%',
              }}
            />

          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            Total storage used by your files
          </p>

        </div>

      </div>


      {/* =============================================
          CATEGORIES
      ============================================= */}

      <div className="mt-6">

        <div className="mb-3 flex items-center justify-between">

          <h2 className="text-lg font-bold">
            Your files
          </h2>

          <Link
            to="/photos"
            className="text-xs font-medium text-brand-500"
          >
            View all
          </Link>

        </div>


        <div className="grid grid-cols-2 gap-3">

          {mobileCategories.map(
            ({
              title,
              count,
              icon: Icon,
              to,
              bg,
              iconBg,
              iconColor,
            }) => (
              <Link
                key={title}
                to={to}
                className={`
                  ${bg}
                  group
                  rounded-2xl
                  border
                  border-white
                  p-4
                  shadow-sm
                  transition
                  active:scale-[0.98]
                `}
              >

                <div
                  className={`
                    ${iconBg}
                    ${iconColor}
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>


                <div className="mt-4 flex items-end justify-between">

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      {title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {count} {count === 1 ? 'file' : 'files'}
                    </p>

                  </div>


                  <ChevronRight
                    className="
                      h-4
                      w-4
                      text-slate-400
                      transition
                      group-hover:translate-x-0.5
                    "
                  />

                </div>

              </Link>
            )
          )}

        </div>

      </div>


      {/* =============================================
          RECENT FILES
      ============================================= */}

      <div className="mt-7">

        <div className="mb-3 flex items-center justify-between">

          <h2 className="text-lg font-bold">
            Recent files
          </h2>

          <Link
            to="/photos"
            className="
              flex
              items-center
              gap-0.5
              text-xs
              font-medium
              text-brand-500
            "
          >
            See all
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>

        </div>


        {stats.recentUploads?.length === 0 ? (

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <EmptyState
              icon={UploadIcon}
              title="No files yet"
              description="Upload your first file to get started."
              action={
                <Link
                  to="/upload"
                  className="btn-primary"
                >
                  Upload files
                </Link>
              }
            />

          </div>

        ) : (

          <div className="space-y-2">

            {stats.recentUploads
              ?.slice(0, 6)
              .map((file) => {

                const isPdf =
                  file.category === 'pdf' ||
                  file.originalName
                    ?.toLowerCase()
                    .endsWith('.pdf');

                const isPhoto =
                  file.category === 'photo';


                return (
                  <Link
                    key={file._id}
                    to={
                      isPhoto
                        ? '/photos'
                        : isPdf
                        ? '/pdfs'
                        : '/documents'
                    }
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-slate-100
                      bg-white
                      p-3
                      shadow-sm
                      transition
                      active:scale-[0.99]
                    "
                  >

                    {/* FILE ICON */}

                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          isPhoto
                            ? 'bg-blue-50 text-blue-500'
                            : isPdf
                            ? 'bg-red-50 text-red-500'
                            : 'bg-emerald-50 text-emerald-500'
                        }
                      `}
                    >

                      {isPhoto ? (
                        <Image className="h-5 w-5" />
                      ) : isPdf ? (
                        <File className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}

                    </div>


                    {/* FILE DETAILS */}

                    <div className="min-w-0 flex-1">

                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-slate-800
                        "
                      >
                        {file.originalName}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(file.createdAt)}
                      </p>

                    </div>


                    <ChevronRight
                      className="
                        h-4
                        w-4
                        shrink-0
                        text-slate-300
                      "
                    />

                  </Link>
                );
              })}

          </div>

        )}

      </div>


      {/* =============================================
          FLOATING UPLOAD BUTTON
      ============================================= */}

      <Link
        to="/upload"
        className="
          fixed
          bottom-20
          right-5
          z-40
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-brand-500
          text-white
          shadow-xl
          shadow-brand-500/30
          transition
          hover:bg-brand-600
          active:scale-95
        "
        aria-label="Upload files"
      >
        <Plus className="h-7 w-7" />
      </Link>

    </div>
  );


  // ===================================================
  // DESKTOP UI
  // ===================================================

  const DesktopDashboard = () => (
    <div className="hidden fade-in lg:block">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-bold">
            Welcome back, {firstName}
          </h1>

          <p className="text-sm text-slate-500">
            Here's what's in your vault
          </p>

        </div>


        <Link
          to="/upload"
          className="btn-primary"
        >
          <UploadIcon className="h-4 w-4" />
          Quick Upload
        </Link>

      </div>


      {/* STAT CARDS */}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">

        <DashboardCard
          icon={Files}
          label="Total Files"
          value={stats.totalFiles}
          tint="brand"
        />

        <DashboardCard
          icon={Image}
          label="Photos"
          value={stats.totalPhotos}
          tint="violet"
        />

        <DashboardCard
          icon={FileText}
          label="Documents + PDFs"
          value={
            stats.totalDocuments +
            stats.totalPdfs
          }
          tint="amber"
        />

        <DashboardCard
          icon={HardDrive}
          label="Storage Used"
          value={formatBytes(stats.storageUsed)}
          tint="emerald"
        />

        <DashboardCard
          icon={Star}
          label="Favorites"
          value={stats.favoritesCount}
          tint="amber"
        />

      </div>


      {/* RECENT UPLOADS */}

      <div className="mt-8">

        <h2 className="mb-3 text-lg font-semibold">
          Recent Uploads
        </h2>


        {stats.recentUploads.length === 0 ? (

          <EmptyState
            icon={UploadIcon}
            title="No files yet"
            description="Upload your first photo or document to get started."
            action={
              <Link
                to="/upload"
                className="btn-primary"
              >
                Upload files
              </Link>
            }
          />

        ) : (

          <div
            className="
              card
              divide-y
              divide-slate-100
              dark:divide-slate-800
            "
          >

            {stats.recentUploads.map(
              (file) => (

                <div
                  key={file._id}
                  className="
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3
                    text-sm
                  "
                >

                  <span className="truncate font-medium">
                    {file.originalName}
                  </span>

                  <span className="shrink-0 text-slate-400">
                    {formatDate(file.createdAt)}
                  </span>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );


  // ===================================================
  // RETURN
  // ===================================================

  return (
    <div className="flex min-h-screen flex-col">

      <div className="flex-1">
        <MobileDashboard />
        <DesktopDashboard />
      </div>

      <Footer />

    </div>
  );
}