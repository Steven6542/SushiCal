import { useNavigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function Layout() {
    const navigate = useNavigate();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/login');
            return;
        }

        // Check if admin
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .maybeSingle(); // Use maybeSingle to avoid 406/JSON error if no row exists

        if (error) {
            console.error('Error fetching profile:', error);
            // Don't block logout, but block access
            alert('Error fetching user profile.');
            await supabase.auth.signOut();
            navigate('/login');
            return;
        }

        if (!profile || !profile.is_admin) {
            alert('Access Denied: You are not an admin.');
            await supabase.auth.signOut();
            navigate('/login');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold">SushiCalc Admin</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <a href="/" className="block py-2 px-4 rounded bg-gray-800 text-white font-medium">
                        Brands
                    </a>
                    {/* Add more links here later */}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full py-2 px-4 rounded border border-gray-600 hover:bg-gray-800 text-gray-300 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
