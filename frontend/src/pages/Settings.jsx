import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Settings() {
    const [user, setUser] = useState(null);
    const [locations, setLocations] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ login_id: '', email: '' });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        // Fetch user profile
        api.get('/auth/me')
            .then(res => {
                setUser(res.data);
                setEditForm({
                    login_id: res.data.login_id,
                    email: res.data.email
                });
            })
            .catch(err => console.error('Failed to fetch user', err));

        // Fetch locations
        api.get('/locations')
            .then(res => setLocations(res.data))
            .catch(err => console.error('Failed to fetch locations', err));
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            const res = await api.put('/auth/me', editForm);
            setUser(res.data);
            setEditMode(false);
            setMsg('Profile updated successfully!');
            setTimeout(() => setMsg(''), 3000);
        } catch (err) {
            setMsg('Error: ' + (err.response?.data?.detail || 'Failed to update'));
        }
    };

    return (
        <div>
            <h1>Settings</h1>

            {/* Profile Section */}
            <div className="card" style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                    My Profile
                </h2>
                
                {!editMode ? (
                    <div>
                        {user && (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <strong>Login ID:</strong> {user.login_id}
                                </div>
                                <div>
                                    <strong>Email:</strong> {user.email}
                                </div>
                                <div>
                                    <strong>Role:</strong> <span style={{ 
                                        textTransform: 'capitalize',
                                        padding: '4px 8px',
                                        background: user.role === 'manager' ? '#E6F4EA' : '#FFF8E1',
                                        color: user.role === 'manager' ? '#1E7E34' : '#B7791F',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setEditMode(true)}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#017E84',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        width: 'fit-content'
                                    }}
                                >
                                    Edit Profile
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label>Login ID</label>
                            <input
                                type="text"
                                value={editForm.login_id}
                                onChange={e => setEditForm({...editForm, login_id: e.target.value})}
                                required
                                minLength={6}
                                maxLength={12}
                            />
                            <small style={{ color: '#666' }}>6-12 characters</small>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                value={editForm.email}
                                onChange={e => setEditForm({...editForm, email: e.target.value})}
                                required
                            />
                        </div>
                        {msg && (
                            <div style={{
                                padding: '10px',
                                background: msg.includes('Error') ? '#f8d7da' : '#d4edda',
                                color: msg.includes('Error') ? '#721c24' : '#155724',
                                borderRadius: '4px',
                                marginBottom: '15px'
                            }}>
                                {msg}
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" style={{ flex: 1 }}>Save Changes</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditMode(false);
                                    setEditForm({
                                        login_id: user?.login_id || '',
                                        email: user?.email || ''
                                    });
                                    setMsg('');
                                }}
                                style={{ flex: 1, background: '#ccc' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Warehouse/Locations Section */}
            <div className="card">
                <h2 style={{ marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>
                    Warehouse Locations
                </h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                    No locations found
                                </td>
                            </tr>
                        ) : (
                            locations.map(loc => (
                                <tr key={loc.id}>
                                    <td>{loc.id}</td>
                                    <td>{loc.name}</td>
                                    <td>
                                        <span style={{
                                            textTransform: 'capitalize',
                                            padding: '4px 8px',
                                            background: loc.type === 'internal' ? '#E6F4EA' : 
                                                       loc.type === 'vendor' ? '#FFF8E1' :
                                                       loc.type === 'customer' ? '#D1ECF1' : '#F8D7DA',
                                            color: loc.type === 'internal' ? '#1E7E34' :
                                                   loc.type === 'vendor' ? '#B7791F' :
                                                   loc.type === 'customer' ? '#0C5460' : '#721C24',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            {loc.type}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

