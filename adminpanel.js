import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function AdminPanel() {
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState(new Date());
  const [maxPlayers, setMaxPlayers] = useState(16);
  const [error, setError] = useState(null);

  const handleCreateGame = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'games'), {
        venue,
        date: date.toISOString(),
        maxPlayers: Number(maxPlayers),
        participants: [],
        waitingList: [],
        createdAt: new Date().toISOString()
      });
      alert('Game created successfully!');
      setVenue('');
      setDate(new Date());
      setMaxPlayers(16);
    } catch (error) {
      setError('Error creating game: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Game</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleCreateGame}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Date and Time</label>
          <DatePicker
            selected={date}
            onChange={setDate}
            showTimeSelect
            dateFormat="Pp"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Max Players</label>
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Game
        </button>
      </form>
    </div>
  );
}

export default AdminPanel;
