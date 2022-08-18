import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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

function App() {
  const [timeElapsed, setTimeElapsed] = useState({
    seconds: 0,
    minutes: 0,
    hours: 0,
  });
  const [characterStatus, setCharacterStatus] = useState({
    waldo: false,
    wizard: false,
    wanda: false,
    odlaw: false,
  });
  const [gameOver, setGameOver] = useState(false);

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
    const gameOverEvent = () => {
      const imageContainer = document.querySelector('img');
      imageContainer.style.pointerEvents = 'none';
    }

    const displayGameOverMessage = () => {
      if (document.getElementById('game-over-message')) return;

      const gameStatsContainer = document.getElementById('game-stats');
      const gameOverMessage = document.createElement('p');
      gameOverMessage.id = 'game-over-message';
      gameOverMessage.textContent = 'You found everyone, congrats!';
  
      gameStatsContainer.appendChild(gameOverMessage);
    }

    const checkIfGameover = () => {
      if (Object.keys(characterStatus).every((character) => characterStatus[character])) {
        setGameOver(true);
        gameOverEvent();
        displayGameOverMessage();
      }
    }

    checkIfGameover();
  }, [characterStatus])

  const characterCoordinates = {
    waldo: [640, 450],
    wizard: [755, 450],
    wanda: [785, 735],
    odlaw: [290, 455],
  }

  const generateBox = (e) => {
    const selectionBox = document.getElementById('selection-box');
    selectionBox.style.display = 'block';
    selectionBox.style.top = `${e.nativeEvent.offsetY - 30}px`;
    selectionBox.style.left = `${e.nativeEvent.offsetX - 30}px`;
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
    const wrongChoice = (e) => {
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
      wrongChoice(e);
    }

    selectionBox.style.display = 'none';
  }
  const displayTimeElapsed = () => {
    const totalHours = timeElapsed.hours;
    const totalMinutes = timeElapsed.minutes;
    const totalSeconds = timeElapsed.seconds;

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
  const hideSelectionBox = (() => {
    document.addEventListener('keydown', (e) => {
      const selectionBox = document.getElementById('selection-box');
      if (e.key === 'Escape') selectionBox.style.display = 'none';
    });
  })();

  return (
    <div>
      <GameStats id="game-stats">
          <p>Time Elapsed: {displayTimeElapsed()}</p>
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
    </div>
  );
}

export default App;
