import React, { useState, useEffect } from 'react';
import { AnalyticsEvent } from '../types/analytics';
import { DataLayerWindow } from '../types/analytics';
import { useProduct } from '../context/ProductContext';
import { useSession } from '../context/SessionContext';
// import { generateRandomId } from '../utils/random';

declare const window: DataLayerWindow;

export const AdminPage: React.FC = () => {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<AnalyticsEvent | null>(null);
    const [filterName, setFilterName] = useState('');
    const { refreshRanking } = useProduct();
    const { logout } = useSession();

    useEffect(() => {
        // Initial load
        if (window.dataLayer) {
            setEvents([...window.dataLayer].reverse().slice(0, 500));
        }

        // Listen for new events
        const handleNewEvent = (e: CustomEvent<AnalyticsEvent>) => {
            setEvents(prev => [e.detail, ...prev].slice(0, 500));
        };

        window.addEventListener('martinee_analytics_event', handleNewEvent as EventListener);
        return () => window.removeEventListener('martinee_analytics_event', handleNewEvent as EventListener);
    }, []);

    const filteredEvents = events.filter(e =>
        e.event_name.toLowerCase().includes(filterName.toLowerCase()) ||
        (e.user_id && e.user_id.toLowerCase().includes(filterName.toLowerCase()))
    );

    const handleForceEvent = () => {
        const dummyEvent: AnalyticsEvent = {
            event_category: 'debug',
            event_name: 'force_debug_event',
            event_description: 'Forced event from admin',
            user_id: 'admin',
            session_id: 'debug_session',
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            device_type: 'web',
            additional_params: { random: Math.random() }
        };
        window.dataLayer.push(dummyEvent);
        window.dispatchEvent(new CustomEvent('martinee_analytics_event', { detail: dummyEvent }));
    };

    const handleResetSession = () => {
        logout();
        alert('Session reset (logged out)');
    };

    const handleRankRefresh = () => {
        refreshRanking();
        alert('Rankings refreshed');
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="font-bold mb-2">Controls</h3>
                    <div className="space-y-2 flex flex-col">
                        <button onClick={handleForceEvent} className="bg-blue-500 text-white px-3 py-1 rounded">Force Debug Event</button>
                        <button onClick={handleResetSession} className="bg-red-500 text-white px-3 py-1 rounded">Reset Session</button>
                        <button onClick={handleRankRefresh} className="bg-green-500 text-white px-3 py-1 rounded">Refresh Rankings</button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded shadow col-span-3">
                    <h3 className="font-bold mb-2">Event Log ({filteredEvents.length})</h3>
                    <input
                        type="text"
                        placeholder="Filter by event name or user id..."
                        className="w-full border p-2 rounded mb-4"
                        value={filterName}
                        onChange={e => setFilterName(e.target.value)}
                    />

                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="min-w-full text-xs">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left">Time</th>
                                    <th className="px-4 py-2 text-left">Event Name</th>
                                    <th className="px-4 py-2 text-left">User ID</th>
                                    <th className="px-4 py-2 text-left">Session ID</th>
                                    <th className="px-4 py-2 text-left">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredEvents.map((ev, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{ev.timestamp.split('T')[1].split('.')[0]}</td>
                                        <td className="px-4 py-2 font-medium text-blue-600">{ev.event_name}</td>
                                        <td className="px-4 py-2">{ev.user_id || '-'}</td>
                                        <td className="px-4 py-2 font-mono text-gray-500">{ev.session_id.slice(0, 8)}...</td>
                                        <td className="px-4 py-2">
                                            <button
                                                onClick={() => setSelectedEvent(ev)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{selectedEvent.event_name}</h2>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-black">Close</button>
                        </div>
                        <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto text-sm">
                            {JSON.stringify(selectedEvent, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};
