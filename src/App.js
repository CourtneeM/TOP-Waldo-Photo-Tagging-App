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
`;

function App() {
  const characterCoordinates = {
    waldo: [],
    wizard: null,
    wanda: null,
    odlaw: null,
  }

  const generateBox = (e) => {
    const selectionBox = document.getElementById('selection-box');
    selectionBox.style.display = 'block';
    selectionBox.style.top = `${e.nativeEvent.offsetY - 30}px`;
    selectionBox.style.left = `${e.nativeEvent.offsetX - 30}px`;
    console.log('x: ' + e.nativeEvent.offsetX, 'y: ' + e.nativeEvent.offsetY);
    // console.log(e);

    // waldo coordinates
    // TL: 605, 425
    // TR: 665, 425
    // BL: 605, 485
    // BR: 665, 485
  }

  return (
    <div>
      <Wrapper>
        <img src={beachScene} alt="a" onClick={(e) => generateBox(e)} />
        <div id="selection-box">
          <ul>
            <li>Waldo</li>
            <li>Wizard</li>
            <li>Wanda</li>
            <li>Odlaw</li>
          </ul>
        </div>
      </Wrapper>
    </div>
  );
}

export default App;
