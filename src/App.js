import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { collection, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { getFirebaseConfig } from './firebase-config';
import styled from 'styled-components';

import beachScene from './images/waldo-beach-scene.avif';

const app = initializeApp(getFirebaseConfig());
const db = getFirestore(app);

const Wrapper = styled.div`
  position: relative;
  width: fit-content;
  margin: 0 auto;

  #selection-box {
    position: absolute;
    top: 0;
    left: 0;
    display: none;
    width: 60px;
    height: 60px;
    border: 7px solid red;

    ul {
      position: relative;
      top: 53px;
      left: -7px;
      width: 100px;
      background-color: #fff;
      border-radius: 0 8px 8px 8px;
    }

    li {
      padding: 10px;
      list-style: none;

      &:first-child { border-radius: 0 8px 0 0; }
      &:last-child { border-radius: 0 0 8px 8px; }

      &:hover {
        background-color: #ccc;
        cursor: pointer;
      }
    }
  }

  .correct-selection-box {
    position: absolute;
    width: 60px;
    height: 60px;
    border: 7px solid green;
    
    p:first-child {
      position: relative;
      top: -20px;
      right: -15px;
      padding: 2px 5px;
      width: fit-content;
      border: 1px solid #000;
      background-color: #fff;
      transform: rotate(20deg);
    }

    .correct-choice-float {
      position: relative;
      top: -23px;
      left: -25px;
      width: 100px;
      padding: 5px;
      font-size: 1.2rem;
      text-align: center;
      color: green;
      background-color: #fff;
      box-shadow: 0 4px 10px 2px #000;
    }

  }

  .wrong-choice-float {
    position: absolute;
    width: 100px;
    padding: 5px;
    font-size: 1.2rem;
    text-align: center;
    color: red;
    background-color: #fff;
    box-shadow: 0 4px 10px 2px #000;
  }
`;
const GameStats = styled.div`
  display: flex;
  gap: 20px;
  width: fit-content;
  margin: 0 auto;
  padding: 5px 20px;
  background-color: #eee;
  border: 2px solid #000;

  p:first-child {
    padding-right: 20px;
    border-right: 1px solid #ccc;
  }

  #game-over-message {
    font-weight: bold;
    padding-left: 20px;
    border-left: 1px solid #ccc;
  }
`;
const NameInput = styled.div`
  display: none;
  position: absolute;
  top: 175px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  margin: 0 auto 40px;
  padding: 20px;
  text-align: center;
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 10px;

  p:first-child { margin-bottom: 4px; }
  p:nth-child(2) { margin-bottom: 10px; }

  input {
    width: 50%;
    margin-bottom: 8px;
    padding: 5px 10px;
  }

  button {
    display: block;
    width: 50%;
    margin: 0 auto;
    padding: 5px 25px;
    cursor: pointer;
  }
`;
const Leaderboards = styled.div`
  display: none;
  position: absolute;
  top: 125px;
  left: 50%;
  transform: translateX(-50%);
  width: 400px;
  margin: 0 auto 40px;
  padding: 20px;
  text-align: center;
  background-color: #fff;
  border: 1px solid #000;
  border-radius: 10px;

  > div:nth-child(2) {
    display: flex;
    padding: 10px 0;
    font-weight: bold;
  }

  p {
    width: 150px;
    padding: 5px 0;
    margin: 0 auto;
  }

  .leaderboard-stat-container {
    display: flex;
    justify-content: center;
    
    &:nth-child(odd) {
      background-color: #eee;
    }
  }

  button {
    margin-top: 15px;
    padding: 5px 20px;
    cursor: pointer;
  }
`;

function App() {
  const [timeElapsed, setTimeElapsed] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [characterStatus, setCharacterStatus] = useState({
    waldo: false,
    wizard: false,
    wanda: false,
    odlaw: false,
  });
  const [characterCoordinates, setCharacterCoordinates] = useState({})
  const [gameOver, setGameOver] = useState(false);
  const [leaderboards, setLeaderboards] = useState([]);
  const [newHighScoreIndex, setNewHighScoreIndex] = useState(null);
  const [highScoreName, setHighScoreName] = useState('Anonymous');
  const [round, setRound] = useState(1);

  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, 'photo data', 'beach-scene');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLeaderboards(docSnap.data().leaderboards);
        setCharacterCoordinates(docSnap.data().characterCoordinates);
      }
    }

    getData();
  }, [])
  useEffect(() => {
    if (!gameOver) {
      const gameTimer = setInterval(() => {
        const timeElapsedCopy = {...timeElapsed};
        timeElapsedCopy.seconds = Number(timeElapsedCopy.seconds) + 1;

        if (timeElapsedCopy.seconds === 60) {
          timeElapsedCopy.seconds = 0;
          timeElapsedCopy.minutes = Number(timeElapsedCopy.minutes) + 1;
        }

        if (timeElapsedCopy.minutes === 60) {
          timeElapsedCopy.minutes = 0;
          timeElapsedCopy.hours = Number(timeElapsedCopy.hours) + 1;
        }

        setTimeElapsed(timeElapsedCopy);
      }, 1000);
      return () => clearInterval(gameTimer);
    }
  });
  useEffect(() => {
    const checkIfGameover = () => {
      if (Object.keys(characterStatus).every((character) => characterStatus[character])) {
        if (gameOver) return;
        setGameOver(true);
      }
    }

    if (!document.querySelector('.image-container').firstChild) gameSetup();
    if (round > 1 && document.querySelector('.image-container').firstChild) {
      [...document.querySelectorAll('.image-container ul li')].forEach((li) => li.addEventListener('click', (e) => checkAnswer(e)));
    }

    checkIfGameover();
  }, [characterStatus]);
  useEffect(() => {
    const gameOverEvent = () => {
      const imageContainer = document.querySelector('img');
      imageContainer.style.pointerEvents = 'none';
    }
    const isNewHighScore = () => {
      let newScore = false;

      if (leaderboards.length === 0) {
        setNewHighScoreIndex(0);
        newScore = true;
        return newScore;
      }

      leaderboards.forEach(({_, time}, i) => {
        if (newScore) return;
        const statTotalTimeSeconds = (time.hours * 3600) + (time.minutes * 60) + time.seconds;
        const timeElaspedTotalTimeSeconds = (timeElapsed.hours * 3600) + (timeElapsed.minutes * 60) + timeElapsed.seconds;

        newScore = timeElaspedTotalTimeSeconds < statTotalTimeSeconds;
        setNewHighScoreIndex(i);
      });

      if (leaderboards.length < 10 && !newScore) {
        setNewHighScoreIndex(leaderboards.length);
        newScore = true;
      }

      return newScore;
    }
    const resetGame = () => {
      setCharacterStatus({
        waldo: false,
        wizard: false,
        wanda: false,
        odlaw: false,
      });
      setTimeElapsed({hours: 0, minutes: 0, seconds: 0});
      setGameOver(false);
      setNewHighScoreIndex(null);
      setHighScoreName('Anonymous');
      setRound(round + 1);


      [document.getElementById('game-over-message'), document.getElementById('reset-btn')].forEach((el) => {
        document.getElementById('game-stats').removeChild(el);
      })
      document.getElementById('name-input-container').style.display = 'none';
      document.getElementById('leaderboards').style.display = 'none';

      const imageContainer = document.querySelector('.image-container');
      imageContainer.style.pointerEvents = 'auto';

      while (imageContainer.firstChild) {
        imageContainer.removeChild(imageContainer.firstChild);
      }
    }

    const displayGameOverMessage = () => {
      const gameStatsContainer = document.getElementById('game-stats');
      const gameOverMessage = document.createElement('p');
      const resetBtn = document.createElement('button');

      gameOverMessage.id = 'game-over-message';
      gameOverMessage.textContent = 'You found everyone, congrats!';
      
      resetBtn.id = 'reset-btn';
      resetBtn.textContent = 'Reset';
      resetBtn.addEventListener('click', resetGame);

      [gameOverMessage, resetBtn].forEach((el) => gameStatsContainer.appendChild(el));
    }
    const displayNameInput = () => {
      document.getElementById('name-input-container').style.display = 'block';
    }

    if (gameOver) {
      if (document.getElementById('game-over-message') && document.getElementById('game-over-message').style.display === 'block') return;
      gameOverEvent();
      displayGameOverMessage();

      if (isNewHighScore()) {
        displayNameInput();
      } else {
        round > 1 ? document.getElementById('leaderboards').style.display = 'block' : displayLeaderboards();
      }
    }
  }, [gameOver]);
  useEffect(() => {
    if (document.getElementById('leaderboards').style.display === 'block') return;

    const writeData = async () => {
      const docRef = doc(db, 'photo data', 'beach-scene');
      await updateDoc(docRef, {
        leaderboards: leaderboards
      })
    }

    if (newHighScoreIndex !== null) writeData();
    if (gameOver) {
      const playersScoresContainer = document.getElementById('players-scores');
      while(playersScoresContainer.firstChild) {
        playersScoresContainer.removeChild(playersScoresContainer.firstChild);
      }
      displayLeaderboards();
    }
  }, [leaderboards]);

  const gameSetup = () => {
    const image = document.createElement('img');
    image.src = beachScene;
    image.alt = "game scene";
    image.addEventListener('click', (e) =>  generateBox(e));

    const selectionBox = document.createElement('div');
    selectionBox.id = 'selection-box';

    const ul = document.createElement('ul');
    Object.keys(characterCoordinates).forEach((character) => {
      const characterName = character.split('')[0].toUpperCase() + character.split('').splice(1, character.length).join('');
      const li = document.createElement('li');

      li.textContent = characterName;

      ul.appendChild(li);
    });

    selectionBox.appendChild(ul);

    [image, selectionBox].forEach((el) => document.querySelector('.image-container').appendChild(el));
  }

  const generateBox = (e) => {
    const selectionBox = document.getElementById('selection-box');

    selectionBox.style.display = 'block';
    if (e.nativeEvent) {
      selectionBox.style.top = `${(e.nativeEvent.offsetY) - 30}px`;
      selectionBox.style.left = `${(e.nativeEvent.offsetX) - 30}px`;
    } else {
      selectionBox.style.top = `${(e.offsetY) - 30}px`;
      selectionBox.style.left = `${(e.offsetX) - 30}px`;
    }
  }
  const checkAnswer = (e) => {
    const [correctX, correctY] = characterCoordinates[e.target.textContent.toLowerCase()];
    const imageContainer = document.querySelector('.image-container');
    const selectionBox = document.getElementById('selection-box');

    const getUserOffsets = () => {
      const minOffsetX = Number(selectionBox.style.left.replace('px', ''));
      const maxOffsetX = Number(selectionBox.style.left.replace('px', '')) + 80;
      const minOffsetY = Number(selectionBox.style.top.replace('px', ''));
      const maxOffsetY = Number(selectionBox.style.top.replace('px', '')) + 80;
      
      return [minOffsetX, maxOffsetX, minOffsetY, maxOffsetY]; 
    }
    const correctChoice = () => {
      if ([...document.querySelectorAll('.correct-selection-box')].length !== Object.keys(characterStatus).filter((key) => characterStatus[key]).length) return;
      
      const generateCorrectBox = () => {
        const correctBox = document.createElement('div');
        correctBox.classList.add('correct-selection-box');
        correctBox.style.top = selectionBox.style.top;
        correctBox.style.left = selectionBox.style.left;
        
        return correctBox;
      }
      const generateCharacterName = () => {
        const characterName = document.createElement('p');
        characterName.textContent = e.target.textContent;

        return characterName;
      }
      const generateCorrectChoiceMessage = () => {
        const correctChoiceMessage = document.createElement('p');
        correctChoiceMessage.classList.add('correct-choice-float');
        correctChoiceMessage.textContent = 'Good Job!';

        return correctChoiceMessage;
      }
      const markOutCorrectChoice = () => {
        e.target.style.textDecoration = 'line-through';
        e.target.style.textColor = '#333';
        e.target.style.backgroundColor = '#ccc'
        e.target.style.pointerEvents = 'none';
      }

      const correctBox = generateCorrectBox();
      const characterName = generateCharacterName();
      const correctChoiceMessage = generateCorrectChoiceMessage();

      correctBox.appendChild(characterName);
      imageContainer.appendChild(correctBox);

      correctBox.appendChild(correctChoiceMessage);
      setTimeout(() => correctBox.removeChild(correctChoiceMessage), 2000);

      markOutCorrectChoice();

      const characterStatusCopy = {...characterStatus};
      characterStatusCopy[e.target.textContent.toLowerCase()] = true;
      setCharacterStatus(characterStatusCopy);
    }
    const wrongChoice = () => {
      console.log(characterStatus);
      const generateWrongChoiceMessage = () => {
        const wrongChoiceMessage = document.createElement('p');
        wrongChoiceMessage.classList.add('wrong-choice-float');
        wrongChoiceMessage.textContent = 'Try Again';

        return wrongChoiceMessage;
      }

      const wrongChoiceMessage = generateWrongChoiceMessage();
      wrongChoiceMessage.style.top = `${Number(selectionBox.style.top.replace('px', '')) + 10}px`;
      wrongChoiceMessage.style.left = `${Number(selectionBox.style.left.replace('px', '')) - 20}px`;

      imageContainer.appendChild(wrongChoiceMessage);
      setTimeout(() => imageContainer.removeChild(wrongChoiceMessage), 2000);
    }

    const [minOffsetX, maxOffsetX, minOffsetY, maxOffsetY] = getUserOffsets();

    if ((minOffsetX < correctX && correctX < maxOffsetX) && (minOffsetY < correctY && correctY < maxOffsetY)) {
      correctChoice();
    } else {
      wrongChoice();
    }

    selectionBox.style.display = 'none';
  }
  const updateLeaderboard = () => {
    const leaderboardsCopy = [...leaderboards];

    if (leaderboardsCopy.length >= 10) leaderboardsCopy.pop();

    leaderboardsCopy.splice(newHighScoreIndex, 0, { name: highScoreName, time: { ...timeElapsed } });

    setLeaderboards(leaderboardsCopy);
  };

  const displayTimeElapsed = (time) => {
    const totalHours = time.hours;
    const totalMinutes = time.minutes;
    const totalSeconds = time.seconds;

    const hoursMessage = totalHours > '1' ? `${totalHours}h ` : totalHours === 1 ? `${totalHours}h ` : null;
    const minutesMessage = totalMinutes > '1' ? `${totalMinutes}m ` : totalMinutes === 1 ? `${totalMinutes}m ` : totalHours ? '0m ' : null;
    const secondsMessage = totalSeconds > '1' ? `${totalSeconds}s` : totalSeconds === 1 ? `${totalSeconds}s` : '0s';

    return (
      hoursMessage ? hoursMessage + minutesMessage + secondsMessage :
      minutesMessage ? minutesMessage + secondsMessage :
      secondsMessage
    );
  }
  const displayCharactersFound = () => {
    return `${Object.values(characterStatus).filter((foundStatus) => foundStatus).length}/${Object.values(characterStatus).length}`;
  }
  const displayLeaderboards = () => {
    const leaderboardsContainer = document.getElementById('leaderboards');
    const playersScoresContainer = document.getElementById('players-scores');
    
    leaderboardsContainer.style.display = 'block';
    leaderboards.forEach((stat) => {
      const statContainer = document.createElement('div');
      const statName = document.createElement('p');
      const statTime = document.createElement('p');

      statContainer.classList.add('leaderboard-stat-container');

      statName.textContent = stat.name;
      statTime.textContent = displayTimeElapsed(stat.time);

      [statName, statTime].forEach((el) => statContainer.appendChild(el));
      playersScoresContainer.appendChild(statContainer);
    })
  }
  const closeNameInput = (e) => {
    e.preventDefault();
    document.getElementById('name-input-container').style.display = 'none';

    updateLeaderboard();
  }
  const closeLeaderboards = (e) => {
    e.preventDefault();
    document.getElementById('leaderboards').style.display = 'none';
  }
  const hideSelectionBox = (() => {
    document.addEventListener('keydown', (e) => {
      const selectionBox = document.getElementById('selection-box');
      if (e.key === 'Escape') selectionBox.style.display = 'none';
    });
  })();

  return (
    <div>
      <GameStats id="game-stats">
        <p>Time Elapsed: {displayTimeElapsed(timeElapsed)}</p>
        <p>Characters Found: {displayCharactersFound()}</p>
      </GameStats>
      <Wrapper className='image-container'>
        <img src={beachScene} alt="a" onClick={(e) => generateBox(e)} />
        <div id="selection-box">
          <ul>
            <li onClick={(e) => checkAnswer(e)}>Waldo</li>
            <li onClick={(e) => checkAnswer(e)}>Wizard</li>
            <li onClick={(e) => checkAnswer(e)}>Wanda</li>
            <li onClick={(e) => checkAnswer(e)}>Odlaw</li>
          </ul>
        </div>
      </Wrapper>
      <NameInput id="name-input-container">
        <p>Congratulations!</p>
        <p>You made it in the top 10 leaderboard.</p>
        <form>
          <input type="text" name="name" id="name" value={highScoreName} placeholder="Name" onChange={(e) => setHighScoreName(e.target.value)} />
          <button onClick={(e) => closeNameInput(e)}>Submit</button>
        </form>
      </NameInput>
      <Leaderboards id="leaderboards">
      <h3>Top 10 Players</h3>
        <div>
          <p>Name</p>
          <p>Time</p>
        </div>
        <div id="players-scores"></div>
        <button onClick={(e) => closeLeaderboards(e)}>Close</button>
      </Leaderboards>
    </div>
  );

}

export default App;
