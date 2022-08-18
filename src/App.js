import { useState } from 'react';
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
    
    p {
      position: relative;
      top: -20px;
      right: -15px;
      padding: 2px 5px;
      width: fit-content;
      border: 1px solid #000;
      background-color: #fff;
      transform: rotate(20deg);
    }
  }
`;

function App() {
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
    // console.log('x: ' + e.nativeEvent.offsetX, 'y: ' + e.nativeEvent.offsetY);
  }

  const checkAnswer = (e) => {
    const [correctX, correctY] = characterCoordinates[e.target.textContent.toLowerCase()];
    const selectionBox = document.getElementById('selection-box');
    const minOffsetX = Number(selectionBox.style.left.replace('px', ''));
    const maxOffsetX = Number(selectionBox.style.left.replace('px', '')) + 80;
    const minOffsetY = Number(selectionBox.style.top.replace('px', ''));
    const maxOffsetY = Number(selectionBox.style.top.replace('px', '')) + 80;

    if ((minOffsetX < correctX && correctX < maxOffsetX) && (minOffsetY < correctY && correctY < maxOffsetY)) {
      // place permanent box
      const imageContainer = document.querySelector('.image-container');
      const correctBox = document.createElement('div');
      correctBox.classList.add('correct-selection-box');
      correctBox.style.top = selectionBox.style.top;
      correctBox.style.left = selectionBox.style.left;

      // display character name next to box
      const characterName = document.createElement('p');
      characterName.textContent = e.target.textContent;

      correctBox.appendChild(characterName);
      imageContainer.appendChild(correctBox);


      // give user message about correct choice
      // display message near box for a few seconds  'good job'

      // mark out correct choice in list of characters
      e.target.style.textDecoration = 'line-through';
      e.target.style.textColor = '#333';
      e.target.style.backgroundColor = '#ccc'
      e.target.style.pointerEvents = 'none';
    } else {
      // if answer is wrong, display message 'try again'
      // remove selectionBox until user clicks again

    }
    console.log(`offsetX: ${minOffsetX}, ${maxOffsetX}`);
    console.log(`offsetY: ${minOffsetY}, ${maxOffsetY}`);
  }

  return (
    <div>
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
