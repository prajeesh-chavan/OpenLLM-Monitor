import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  ShieldExclamationIcon,
  WifiIcon,
  HomeIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CpuChipIcon,
  SparklesIcon,
  LightBulbIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

// Base Error Page Component with modern animations
const BaseErrorPage = ({
  errorCode,
  title,
  description,
  icon: Icon,
  iconColor = "text-red-500",
  bgGradient = "from-red-50 to-red-100",
  accentColor = "red",
  children,
  showBackButton = true,
  showHomeButton = true,
  customActions = null,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div
          className={`
            transform transition-all duration-1000 ease-out
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
          `}
        >
          {/* Error Code Badge */}
          {errorCode && (
            <div className="text-center mb-6">
              <span className={`
                inline-flex items-center px-4 py-2 rounded-full text-sm font-medium
                bg-gradient-to-r ${bgGradient} text-${accentColor}-700 border border-${accentColor}-200
                transform transition-all duration-300 hover:scale-105
              `}>
                Error {errorCode}
              </span>
            </div>
          )}

          {/* Main card */}
          <div
            className={`
              bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50
              transform transition-all duration-500 ease-out
              ${hoveredCard ? 'scale-105 shadow-2xl' : 'scale-100'}
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
            `}
            onMouseEnter={() => setHoveredCard(true)}
            onMouseLeave={() => setHoveredCard(false)}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="px-8 py-12 text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className={`
                  p-4 rounded-full bg-gradient-to-br ${bgGradient}
                  transform transition-all duration-500 hover:rotate-12 hover:scale-110
                `}>
                  <Icon className={`h-12 w-12 ${iconColor}`} />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {title}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto">
                {description}
              </p>

              {/* Custom content */}
              {children}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                {showBackButton && (
                  <button
                    onClick={() => window.history.back()}
                    className={`
                      inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl
                      text-base font-medium text-gray-700 bg-white hover:bg-gray-50
                      transform transition-all duration-200 hover:scale-105 hover:shadow-lg
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
                    `}
                  >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Go Back
                  </button>
                )}

                {showHomeButton && (
                  <Link
                    to="/dashboard"
                    className={`
                      inline-flex items-center px-6 py-3 border border-transparent rounded-xl
                      text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700
                      hover:from-blue-700 hover:to-blue-800 transform transition-all duration-200
                      hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2
                      focus:ring-offset-2 focus:ring-blue-500
                    `}
                  >
                    <HomeIcon className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Link>
                )}

                {customActions}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 opacity-60">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              Made with <HeartIcon className="h-4 w-4 text-red-500 mx-1" /> by OpenLLM Monitor
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rate Limit Error (429)
export const RateLimitErrorPage = () => {
  const [countdown, setCountdown] = useState(60);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanRetry(true);
    }
  }, [countdown]);

  const retryRequest = () => {
    window.location.reload();
  };

  return (
    <BaseErrorPage
      errorCode="429"
      title="Whoa there, speed racer! 🏎️"
      description="You're making requests faster than our servers can keep up. Take a breather while we catch up!"
      icon={ClockIcon}
      iconColor="text-amber-500"
      bgGradient="from-amber-50 to-orange-100"
      accentColor="amber"
      customActions={
        <div className="space-y-4">
          {!canRetry ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-center space-x-2">
                <ClockIcon className="h-5 w-5 text-amber-500 animate-spin" />
                <span className="text-amber-700 font-medium">
                  Cool down in {countdown} seconds...
                </span>
              </div>
              <div className="w-full bg-amber-200 rounded-full h-2 mt-3">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((60 - countdown) / 60) * 100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <button
              onClick={retryRequest}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              Try Again
            </button>
          )}
        </div>
      }
    >
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
          <LightBulbIcon className="h-6 w-6 mr-2" />
          Pro Tips While You Wait
        </h3>
        <ul className="text-amber-700 space-y-2 text-left">
          <li className="flex items-start">
            <span className="text-amber-500 mr-2">•</span>
            <span>Check out the <Link to="/analytics" className="text-amber-600 hover:text-amber-800 underline">Analytics Dashboard</Link> for insights</span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-500 mr-2">•</span>
            <span>Consider implementing request batching for better performance</span>
          </li>
          <li className="flex items-start">
            <span className="text-amber-500 mr-2">•</span>
            <span>Rate limits help ensure fair usage for all users</span>
          </li>
        </ul>
      </div>
    </BaseErrorPage>
  );
};

// Not Found Error (404)
export const NotFoundErrorPage = () => {
  const suggestions = [
    { icon: ChartBarIcon, text: "View Analytics", link: "/analytics" },
    { icon: CpuChipIcon, text: "Check Providers", link: "/providers" },
    { icon: HomeIcon, text: "Go to Dashboard", link: "/dashboard" },
  ];

  return (
    <BaseErrorPage
      errorCode="404"
      title="Oops! This page went on vacation 🏖️"
      description="The page you're looking for seems to have wandered off into the digital wilderness."
      icon={ExclamationTriangleIcon}
      iconColor="text-purple-500"
      bgGradient="from-purple-50 to-pink-100"
      accentColor="purple"
    >
      <div className="grid gap-4 sm:grid-cols-3 max-w-md mx-auto mb-6">
        {suggestions.map((suggestion, index) => (
          <Link
            key={index}
            to={suggestion.link}
            className="group flex flex-col items-center p-4 bg-white/50 border border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-300 transform transition-all duration-200 hover:scale-105"
          >
            <suggestion.icon className="h-8 w-8 text-purple-500 group-hover:text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-700 group-hover:text-purple-800">
              {suggestion.text}
            </span>
          </Link>
        ))}
      </div>
    </BaseErrorPage>
  );
};

// Server Error (500)
export const ServerErrorPage = () => {
  const [reportSent, setReportSent] = useState(false);

  const sendErrorReport = () => {
    // Simulate sending error report
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
  };

  return (
    <BaseErrorPage
      errorCode="500"
      title="Ouch! Our servers hit a bump 🤖"
      description="Something went wrong on our end. Our robots are already working to fix this!"
      icon={ShieldExclamationIcon}
      iconColor="text-red-500"
      bgGradient="from-red-50 to-pink-100"
      accentColor="red"
      customActions={
        <button
          onClick={sendErrorReport}
          disabled={reportSent}
          className={`
            inline-flex items-center px-6 py-3 border border-transparent rounded-xl
            text-base font-medium transform transition-all duration-200 hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${reportSent
              ? 'text-green-700 bg-green-100 border-green-200 cursor-not-allowed'
              : 'text-red-700 bg-red-100 hover:bg-red-200 border-red-200 focus:ring-red-500'
            }
          `}
        >
          {reportSent ? (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              Report Sent!
            </>
          ) : (
            <>
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              Report Issue
            </>
          )}
        </button>
      }
    >
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-red-800 mb-3">What happened?</h3>
        <p className="text-red-700 text-left">
          Our monitoring systems have been notified and our engineering team is investigating.
          You can help by reporting what you were doing when this error occurred.
        </p>
      </div>
    </BaseErrorPage>
  );
};

// Network Error
export const NetworkErrorPage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retryConnection = async () => {
    setRetrying(true);
    // Simulate retry delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (navigator.onLine) {
      window.location.reload();
    }
    setRetrying(false);
  };

  return (
    <BaseErrorPage
      title={isOnline ? "Connection Hiccup 📡" : "You're Offline 📵"}
      description={
        isOnline
          ? "We're having trouble connecting to our servers. Your internet seems fine though!"
          : "Looks like you're not connected to the internet. Check your connection and try again."
      }
      icon={WifiIcon}
      iconColor={isOnline ? "text-orange-500" : "text-gray-500"}
      bgGradient={isOnline ? "from-orange-50 to-yellow-100" : "from-gray-50 to-gray-100"}
      accentColor={isOnline ? "orange" : "gray"}
      customActions={
        <button
          onClick={retryConnection}
          disabled={retrying || !isOnline}
          className={`
            inline-flex items-center px-6 py-3 border border-transparent rounded-xl
            text-base font-medium transform transition-all duration-200 hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isOnline
              ? 'text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500'
              : 'text-gray-500 bg-gray-200 cursor-not-allowed'
            }
          `}
        >
          {retrying ? (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <WifiIcon className="h-5 w-5 mr-2" />
              {isOnline ? "Retry Connection" : "Waiting for Connection"}
            </>
          )}
        </button>
      }
    >
      <div className={`
        border rounded-xl p-4 mb-6
        ${isOnline ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}
      `}>
        <div className="flex items-center justify-center space-x-2">
          <div className={`
            w-3 h-3 rounded-full
            ${isOnline ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'}
          `}></div>
          <span className={`font-medium ${isOnline ? 'text-orange-700' : 'text-gray-600'}`}>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </BaseErrorPage>
  );
};

// Generic Error Page
export const GenericErrorPage = ({ error, resetError }) => {
  return (
    <BaseErrorPage
      title="Something Unexpected Happened 🤔"
      description="Don't worry, these things happen! Our team has been notified and we're looking into it."
      icon={ExclamationTriangleIcon}
      iconColor="text-gray-500"
      bgGradient="from-gray-50 to-gray-100"
      accentColor="gray"
      customActions={
        resetError && (
          <button
            onClick={resetError}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Try Again
          </button>
        )
      }
    >
      {error && process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left bg-gray-50 border border-gray-200 rounded-xl p-4">
          <summary className="cursor-pointer text-sm text-gray-700 font-medium mb-2">
            Error Details (Development Only)
          </summary>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
            {error.toString()}
          </pre>
        </details>
      )}
    </BaseErrorPage>
  );
};

export default {
  RateLimitErrorPage,
  NotFoundErrorPage,
  ServerErrorPage,
  NetworkErrorPage,
  GenericErrorPage,
  BaseErrorPage,
};
