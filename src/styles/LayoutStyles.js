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
  gap: 40px;
  width: 100%;
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

export const MapContainer = styled.div`
  height: 400px;
  flex: 1;
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
  
  }
  button {
    background-color: #FDCA40;
    border-radius: 5px;
    border-style: none;
    color: #292929;
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

export const CheckboxContainer = styled.div`
margin-top: 10px;

`


export const ServiceItem = styled.li`
background: white;
color: rgb(41, 41, 41);
font-size: 16px;
box shadow: 0 2px 3px 0 rgba(154,154,154,0.04);
padding: 15px;
border-radius: 4px;
border: 1px solid rgba(118,118,118,0.1);

h3 {
  font-weight: 400;
  font-size: 18px;
}

`

export const TagsContainer = styled.div`
display: flex;
gap: 10px;
align-items: center;


`

export const Footer = styled.footer `
color: white;
a:visited {
color: white;
text-decoration: none;
}
`

export const CSVData = styled.div `
h2 {
  color: white;
  font-weight: 400;
  font-size: 20px;

}
`
export const BannerContainer = styled.div `
position: fixed;
top: 0;
font-size: 12px;
background:  #FDCA40;
min-width: 100vw;
padding: 10px;
z-index: 100;

p {
  margin-left: 20px;
}
button {
  border-radius: 5px;
  border-style: none;
  color: #292929;
  cursor: pointer;
  padding: 8px;
  text-align: center;    
  margin-left: 20px;


}
a:visited {
  color: black;
}
`

export const MapWrapper = styled.div`
  height: 800px;
  position: relative;



`;

export const Loading = styled.img`
position: fixed;
top: 25%;
left: 12.5%;

`;

