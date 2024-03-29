import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const MapContainer = styled.div`
  height: 400px;
  flex: 1;
  margin-right: 20px;
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

export const DataContainer = styled.div`
  flex: 1;
  ul {
    padding-inline-start: 0px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  li {
    list-style-type: none;
    border: 1px solid #F0F0F0;
    padding: 5px;
  }
  button {
    background-color: #EA4C89;
    border-radius: 5px;
    border-style: none;
    color: #FFFFFF;
    cursor: pointer;
    padding: 8px;
    text-align: center;    

  }

`;

export const Inputs = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  font-size: 18px;
  gap: 20px;
  background-color: white;
  position: absolute;
  top: 45px;
  left: 10px;
  z-index: 10;
  border-radius: 10px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.20);
  left: ${({ isVisible }) => (isVisible ? '10px' : '-100%')};
  transition: left 0.5s ease-in-out;

  label {
      margin-right: 10px;
      margin-bottom: 20px;
  }

  select, input {
    padding: 5px;
    margin-top: 10px;
  }

  input {
  margin-right: 10px;
 }

  button:first-of-type {
    margin-right: 10px;
  }

  @media (max-width: 768px) {
    max-width: 75%;
    button {
     margin-top: 10px;
    }
  }  

`;

export const GlobalStyles = createGlobalStyle`

.mapboxgl-popup {
}
.pop-up-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}
  .popup-title {
    font-size: 16px;
    margin-block-start: 0px;
    margin-block-end: 0px;
  }
 
  .pop-up-item {
    display: flex;
    gap: 5px;
    align-items: center;
  }
  .popup-link {
    text-decoration: none;
  }
  .popup-icon {
    height: 15px;
  }
`;