import logo from './logo.png';
import footerlogo from './footer-logo.png';
import image1 from './image-1.jpg'
import image2 from './image-2.jpg'
import image3 from './image-3.jpg'
import elect from './elect.jpg'



export const assets = {
    logo,
    image1,
    image2,
    image3,
    elect,
    footerlogo
}


export const candidates = [
  {
    id: 1,
    name: 'Kwame Mensah',
    position: 'President',
    image: assets.image1,
  },
  {
    id: 2,
    name: 'Akua Owusu',
    position: 'Entertainment Officer',
    image: assets.image2,
  },
  {
    id: 3,
    name: 'Yaw Boateng',
    position: 'Vice President',
    image: assets.image3,
  },
  {
    id: 4,
    name: 'Esi Asare',
    position: 'General Secretary',
    image: assets.image1,
  },
]