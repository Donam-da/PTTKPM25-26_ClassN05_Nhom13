import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Courses } from './pages/Courses';
import { Registrations } from './pages/Registrations';
import './index.css';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">Ðãng k? tín ch?</Link>
          <nav className="space-x-4 text-sm">
            <Link to="/courses">Khóa h?c</Link>
            <Link to="/registrations">Ðãng k?</Link>
            <Link to="/login">Ðãng nh?p</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
