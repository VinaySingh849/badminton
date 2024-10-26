import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function GameDetails() {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const { id } = useParams();

  const isUserRegistered = () => {
    return game?.participants.some(p => p.id === currentUser.uid);
  };

  const isUserInWaitingList = () => {
    return game?.waitingList.some(p => p.id === currentUser.uid);
  };

  const handleJoinGame = async () => {
    try {
      const gameRef = doc(db, 'games', id);
      const userData = {
        id: currentUser.uid,
        name: currentUser.displayName,
        whatsapp: currentUser.phoneNumber
      };

      if (game.participants.length >= game.maxPlayers) {
        // Add to waiting list
        await updateDoc(gameRef, {
          waitingList: [...game.waitingList, userData]
        });
        alert('Added to waiting list!');
      } else {
        // Add to participants
        await updateDoc(gameRef, {
          participants: [...game.participants, userData]
        });
        alert('Successfully joined the game!');
      }
    } catch (error) {
      alert('Error joining game: ' + error.message);
    }
  };

  const handleCancelParticipation = async () => {
    try {
      const gameRef = doc(db, 'games', id);
      let updatedGame = { ...game };
      
      // Remove from participants
      updatedGame.participants = game.participants.filter(
        p => p.id !== currentUser.uid
      );

      // Promote first person from waiting list
      if (game.waitingList.length > 0) {
        const [promoted, ...remainingWaitList] = game.waitingList;
        updatedGame.participants.push(promoted);
        updatedGame.waitingList = remainingWaitList;
      }

      await updateDoc(gameRef, updatedGame);
      alert('Successfully cancelled participation');
    } catch (error) {
      alert('Error cancelling participation: ' + error.message);
    }
  };

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameDoc = await getDoc(doc(db, 'games', id));
        if (gameDoc.exists()) {
          setGame({ id: gameDoc.id, ...gameDoc.data() });
        } else {
          setError('Game not found');
        }
      } catch (error) {
        setError('Error fetching game: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!game) return <div>Game not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4">{game.venue}</h1>
      <div className="mb-6">
        <p className="text-gray-600">
          Date: {new Date(game.date).toLocaleDateString()}
        </p>
        <p className="text-gray-600">
          Time: {new Date(game.date).toLocaleTimeString()}
        </p>
        <p className="text-gray-600">
          Players: {game.participants.length}/{game.maxPlayers}
        </p>
      </div>

      {!isUserRegistered() && !isUserInWaitingList() && (
        <button
          onClick={handleJoinGame}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {game.participants.length >= game.maxPlayers 
            ? 'Join Waiting List' 
            : 'Join Game'}
        </button>
      )}

      {isUserRegistered() && (
        <button
          onClick={handleCancelParticipation}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Cancel Participation
        </button>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Participants</h2>
        <div className="grid gap-4">
          {game.participants.map((participant, index) => (
            <div 
              key={participant.id} 
              className="bg-gray-50 p-4 rounded"
            >
              <p className="font-medium">{participant.name}</p>
              <p className="text-gray-600">{participant.whatsapp}</p>
            </div>
          ))}
        </div>
      </div>

      {game.waitingList.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Waiting List</h2>
          <div className="grid gap-4">
            {game.waitingList.map((participant, index) => (
              <div 
                key={participant.id} 
                className="bg-gray-50 p-4 rounded flex items-center"
              >
                <span className="font-bold mr-4">#{index + 1}</span>
                <div>
                  <p className="font-medium">{participant.name}</p>
                  <p className="text-gray-600">{participant.whatsapp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameDetails;
