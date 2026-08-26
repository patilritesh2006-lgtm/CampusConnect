import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Calendar, Sparkles, Award, Users, CheckCircle, Bell } from "lucide-react";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-gray-50/50 pt-12 pb-20 md:py-24">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT: TEXT CONTENT */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              <Sparkles size={14} className="text-blue-600 animate-pulse" />
              <span>The Centralized College Activity & Credentials Hub</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
              Your Campus. <br />
              Your Events. <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Your Community.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Discover hackathons, workshops, and college festivals. Track real-time attendance, earn verified digital certificates, and unlock achievement badges all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/student-events"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3.5 rounded-2xl text-sm shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5"
              >
                <span>Explore Events</span>
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/verify-certificate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-bold px-6 py-3.5 rounded-2xl text-sm border border-gray-200 shadow-sm transition hover:border-gray-300"
              >
                <ShieldCheck size={18} className="text-blue-600" />
                <span>Verify Certificate</span>
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200/70 max-w-md mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl font-black text-gray-900">500+</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Active Students</p>
              </div>
              <div>
                <p className="text-2xl font-black text-blue-600">100%</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Verified Digital Certs</p>
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">50+</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Events Hosted</p>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE DASHBOARD UI MOCKUP */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* MAIN MOCKUP CARD */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100/80 backdrop-blur-xl relative z-10 transition hover:shadow-blue-500/10">
                {/* Header of Mockup Card */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <img src="/logo-icon.png" alt="CampusConnect Logo" className="w-8 h-8 object-contain" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Annual Campus Hackathon 2026</h4>
                      <p className="text-[11px] text-gray-500">Innovation Hub • Main Auditorium</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                    Live Roster
                  </span>
                </div>

                {/* Event Highlights inside Mockup */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-blue-50/70 p-3 rounded-2xl border border-blue-100/50">
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Attendance Rate</span>
                    <p className="text-lg font-extrabold text-blue-900 mt-0.5">94% Verified</p>
                  </div>
                  <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100/50">
                    <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Certificates Issued</span>
                    <p className="text-lg font-extrabold text-indigo-900 mt-0.5">142 Issued</p>
                  </div>
                </div>

                {/* Mock Student Attendee Row */}
                <div className="mt-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        RP
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Ritesh Patil</p>
                        <p className="text-[10px] text-gray-500">Comp. Science • Year 3</p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={12} />
                      Present
                    </span>
                  </div>
                </div>

                {/* Live Action Bar in Mockup */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400 font-semibold">Credential Code: <strong className="text-gray-700">CC-2026-ACH-91D342</strong></span>
                  <Link
                    to="/verify-certificate"
                    className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center gap-1"
                  >
                    Verify Authenticity →
                  </Link>
                </div>
              </div>

              {/* FLOATING CHIP 1: Certificate Badge */}
              <div className="absolute -top-5 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-gray-100 flex items-center gap-3 z-20 animate-bounce duration-1000">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                  <Award size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Certificate Ready</p>
                  <p className="text-[9px] text-gray-500">Gold Border Printable</p>
                </div>
              </div>

              {/* FLOATING CHIP 2: Notification Alert */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-gray-100 flex items-center gap-3 z-20">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-900">Instant Alert</p>
                  <p className="text-[9px] text-gray-500">Attendance Confirmed 🎉</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;