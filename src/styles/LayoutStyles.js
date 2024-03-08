import styled from 'styled-components';

export const AppContainer = styled.div`
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto;
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: row-reverse;
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
`;

export const Inputs = styled.div`
display: flex;
flex-direction: column;
gap: 10px;

label {
    margin-right: 5px;
}

`;