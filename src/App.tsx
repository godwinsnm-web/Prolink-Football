/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route, Switch } from 'wouter';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Players from './pages/Players';
import Login from './pages/Login';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-emerald-500/30">
        <Navbar />
        <main>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/players" component={Players} />
            <Route path="/login" component={Login} />
            <Route path="/admin" component={Admin} />
            <Route>
              <div className="p-20 text-center text-slate-500">404 - Page Not Found</div>
            </Route>
          </Switch>
        </main>
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155'
          }
        }} />
      </div>
    </AuthProvider>
  );
}

