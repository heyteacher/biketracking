import { Injectable } from '@angular/core';
import { CountryAmzLinks } from './models/types';

@Injectable({
  providedIn: 'root'
})
export class AmzLinksService {

  countryAmzLinks:CountryAmzLinks = {
    'IT': [
        {
            text: 'Polar H10 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/71ttT1NCxYL._AC_SL300_.jpg',
            url: 'https://www.amazon.it/Polar-Sensore-Frequenza-Cardiaca-Impermeabile/dp/B08411DQ96/ref=as_li_ss_tl?__mk_it_IT=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=B08411DQ96&qid=1600116535&sr=8-1&linkCode=ll1&tag=biketrackin05-21&linkId=9353574c46aa76173ecfca54a56e870a&language=it_IT',
            heartrate: true
        },
        {
            text: 'Polar H9 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51MOepEZrVL._AC_SL300_.jpg',
            url: 'https://www.amazon.it/s/ref=as_li_ss_tl?k=B08411DQ96&__mk_it_IT=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=nb_sb_noss&linkCode=ll2&tag=biketrackin05-21&linkId=4c8b0e1833977bca58f6b5edd9d39bfb&language=it_IT',
            heartrate: true
        },
        {
            text: 'Supporto Smartphone',
            image: 'https://images-na.ssl-images-amazon.com/images/I/418P3yVQkdL._AC_.jpg',
            url: 'https://www.amazon.it/dp/B07SX54VFQ/ref=as_li_ss_tl?psc=1&pd_rd_i=B07SX54VFQ&pd_rd_w=ZRjTs&pf_rd_p=365a3205-59f3-4b5b-b44d-9c9ece8162af&pd_rd_wg=Lh10K&pf_rd_r=JYQQQ1E0KN7HD5YG780Q&pd_rd_r=622ad9e1-d36c-4539-bbff-90d1ccb87693&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExUzBXVUtTNjk1WVJYJmVuY3J5cHRlZElkPUEwNzUwNDEyWklZNEJYNEJQRzM2JmVuY3J5cHRlZEFkSWQ9QTA3NzEyMDIxMUhKVkRHQjhJUTg4JndpZGdldE5hbWU9c3BfZGV0YWlsJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==&linkCode=ll1&tag=biketrackin05-21&linkId=88396da389e70e85ab8b64e177ae6e78&language=it_IT'
        },
        {
            text: 'Xiaomi Redmi 7a',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51s%2B1NLTqxL._AC_SL300_.jpg',
            url: 'https://www.amazon.it/s/ref=as_li_ss_tl?k=B07T3KMJW8&i=electronics&__mk_it_IT=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=nb_sb_noss&linkCode=ll2&tag=biketrackin05-21&linkId=ae63671655bd8af90f59a21105d01f75&language=it_IT'
        }
    ],
    'DE': [
        {
            text: 'Polar H9 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51x7B6-uhkL._AC_SL300_.jpg',
            url: 'https://www.amazon.de/Polar-Herzfrequenz-Sensor-Wasserdichter-Fitnesstraining-Outdoor-Sportarten/dp/B08411DQ96/ref=as_li_ss_tl?crid=3QYR2SGMG3JH9&dchild=1&keywords=h9+polar&qid=1596698656&s=sports&sprefix=h9+,sports,163&sr=1-4&linkCode=ll1&tag=biketracking-21&linkId=0e2b93ce2f925dc3cc55b7faa0cb5c0f&language=en_GB',
            heartrate: true
        },
        {
            text: 'Polar H10 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/71ttT1NCxYL._AC_SL1500_.jpg',
            url: 'https://www.amazon.de/Polar-Herzfrequenz-Sensor-Bluetooth-Wasserdichter-Brustgurt/dp/B07PM54P4N/ref=as_li_ss_tl?dchild=1&keywords=h10+polar&qid=1596698729&s=sports&sr=1-4&th=1&psc=1&linkCode=ll1&tag=biketracking-21&linkId=426bf9b33cf3e2e4b60bd48563b58eb2&language=en_GB',
            heartrate: true
        },
        {
            text: 'Mount Smartphone Bike',
            image: 'https://images-na.ssl-images-amazon.com/images/I/71zK59dUxJL._AC_SL300_.jpg',
            url: 'https://www.amazon.de/BAONUOR-Handyhalterung-Abnehmbare-handyhalter-360%C2%B0drehbar/dp/B084NW819X/ref=as_li_ss_tl?dchild=1&keywords=mount+bike+smartphone&qid=1596698926&refinements=p_76:186730031&rnid=183870031&rps=1&s=sports&sr=1-8&linkCode=ll1&tag=biketracking-21&linkId=1d8f0f364245beaf26748d836db61e34&language=en_GB'
        },
        {
            text: 'Ulefone Note 8P',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51Ei9chFEaL._AC_SL300_.jpg',
            url: 'https://www.amazon.de/Ulefone-Note-Smartphone-Android-Orange/dp/B089K6T2P8/ref=as_li_ss_tl?dchild=1&keywords=smartphone+android&qid=1596699141&refinements=p_n_operating_system_browse-bin:912235031&rnid=912234031&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzTkU1TjRLNzNQQTY5JmVuY3J5cHRlZElkPUEwNDg3NTI3MURORkZMVUUzQVM2TyZlbmNyeXB0ZWRBZElkPUEwMjU5OTkwM0ZYQlo3OExCVllDTiZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=&linkCode=ll1&tag=biketracking-21&linkId=36ff0058e845edd099b404d39011cc65&language=en_GB'
        }
    ],
    'FR': [
        {
            text: 'Polar H9 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51MOepEZrVL._AC_SL300_.jpg',
            url: 'https://www.amazon.fr/Capteur-fr%C3%A9quence-cardiaque-Polar-Bluetooth/dp/B08411CZYL/ref=as_li_ss_tl?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=FWA9N4ECQQTB&dchild=1&keywords=polar+h9+capteur+de+fr%C3%A9quence+cardiaque&qid=1596699433&s=sports&sprefix=polar+h9+,sports,202&sr=1-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEzQ0RGODA5Rkw5SVhCJmVuY3J5cHRlZElkPUEwOTYyOTAwMkVPQ0tCOUFXWEpaWiZlbmNyeXB0ZWRBZElkPUEwNDczMDExMllPMUFVWTEzTFlDOSZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=&linkCode=ll1&tag=biketrackin01-21&linkId=b78f74343538c4a315f56572e0fd9624',
            heartrate: true
        },
        {
            text: 'Polar H10 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/71UoK3QOQkL._AC_SL300_.jpg',
            url: 'https://www.amazon.fr/Polar-H10-Capteur-Fr%C3%A9quence-Cardiaque/dp/B07PNB224C/ref=as_li_ss_tl?dchild=1&keywords=POLAR+H10+HR+SENS+BLE+BLK+M-XXL&qid=1596699350&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExWE5YRzU0V0hUVERSJmVuY3J5cHRlZElkPUEwNDA5OTgwMTBXQjM3QzhVSDZMWSZlbmNyeXB0ZWRBZElkPUEwODMyNTg5M0gzVllPTzRQRlNYOSZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=&linkCode=ll1&tag=biketrackin01-21&linkId=1d3d5d1c8b507d33151cf2dd806ac5a8',
            heartrate: true
        },
        {
            text: 'Smartphone Bike Mount',
            image: 'https://images-na.ssl-images-amazon.com/images/I/61Zlh3k2QiL._AC_SL300_.jpg',
            url: 'https://www.amazon.fr/Cocoda-T%C3%A9l%C3%A9phone-Silicone-Universel-Compatible/dp/B07T5D3ZP3/ref=as_li_ss_tl?__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=mount+bike+smartphone&qid=1596699499&s=sports&sr=1-3-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyQVVLNE8wTzQ1VkNZJmVuY3J5cHRlZElkPUEwMjY3MDYxSzVHNDRPVks2VVdCJmVuY3J5cHRlZEFkSWQ9QTA4MTE5NjYyQ0k1WkpSMzY4RktMJndpZGdldE5hbWU9c3BfYXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==&linkCode=ll1&tag=biketrackin01-21&linkId=d8a34f4b533658ace476e36e7847125e'
        },
        {
            text: 'Xiaomi Redmi 7A',
            image: 'https://images-na.ssl-images-amazon.com/images/I/61jNSpaAN5L._AC_SL300_.jpg',
            url: 'https://www.amazon.fr/dp/B07TB7DJ2J/ref=as_li_ss_tl?dchild=1&keywords=Xiaomi%20Redmi%207a&qid=1596295623&sr=8-1&linkCode=ll1&tag=biketrackin01-21&linkId=75fcbf9511cf7d29b092427caada7f6e'
        }
    ],
    'ES': [
        {
            text: 'Polar H9 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51MOepEZrVL._AC_SL300_.jpg',
            url: 'https://www.amazon.es/Polar-Frecuencia-Bluetooth-Resistente-Practicar/dp/B08411DQ96/ref=as_li_ss_tl?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=POLAR+H10+HR&qid=1596699667&sr=8-4&linkCode=ll1&tag=biketrackin0e-21&linkId=6f004012a17a4c1c3bfbd89b9a2c943a',
            heartrate: true
        },
        {
            text: 'Polar H10 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/71ttT1NCxYL._AC_SL1500_.jpg',
            url: 'https://www.amazon.es/Polar-H10-Sensor-frecuencia-card%C3%ADaca/dp/B07PM54P4N/ref=as_li_ss_tl?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=POLAR+H10+HR&qid=1596699599&sr=8-2&linkCode=ll1&tag=biketrackin0e-21&linkId=a8d2d48af3f16d23e5da49314c86f8ba',
            heartrate: true
        },
        {
            text: 'Smartphone Bike Mount',
            image: 'https://images-na.ssl-images-amazon.com/images/I/61dm1utexmL._AC_SL300_.jpg',
            url: 'https://www.amazon.es/Matone-Bicicleta-Universal-Motocicleta-Smartphones/dp/B077GNWNL8/ref=as_li_ss_tl?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&dchild=1&keywords=mount+bike+smartphone&qid=1596699778&sr=8-3&linkCode=ll1&tag=biketrackin0e-21&linkId=fe70e1d48248c6432e9bba8437251d38'
        },
        {
            text: 'Ulefone Note 8P',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51AygulivXL._AC_.jpg',
            url: 'https://www.amazon.es/Ulefone-Tel%C3%A9fono-Waterdrop-Smartphone-Desbloqueo/dp/B089GGP993/ref=as_li_ss_tl?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=25HFX1TL6RVSK&dchild=1&keywords=smartphone&qid=1596699918&refinements=p_85:831314031,p_n_operating_system_browse-bin:969785031,p_36:1323857031&rnid=1323854031&rps=1&s=electronics&sprefix=smar,aps,192&sr=1-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExOExGQzc3MDhKNUpHJmVuY3J5cHRlZElkPUEwMjcwMTIzMTlZOFhJUlgwMkkwOSZlbmNyeXB0ZWRBZElkPUEwNTE1NzIwMVFJQ05YM1lPWTA0TCZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU=&linkCode=ll1&tag=biketrackin0e-21&linkId=49f742b68139c24bad282544e68be0e6'
        }
    ],
    'UK': [
        {
            text: 'Polar H9 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51MOepEZrVL._AC_SL300_.jpg',
            url: 'https://www.amazon.co.uk/POLAR-Unisexs-Sensor-Bluetooth-Waterproof-Monitor/dp/B08411DQ96/ref=as_li_ss_tl?crid=1E38E82PCO2I8&dchild=1&keywords=polar+h9+heart+rate&qid=1596697729&s=sports&sprefix=polar+h9+,sports,176&sr=1-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUEyRkM3RUhHSFJQWko2JmVuY3J5cHRlZElkPUEwMDc4MzU1SkpOS0FBUkJOTTVKJmVuY3J5cHRlZEFkSWQ9QTA4MTczMTBOMVlESkw2R0xOWVcmd2lkZ2V0TmFtZT1zcF9hdGYmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl&linkCode=ll1&tag=biketrackin0b-21&linkId=e672c2fb3455dd69d13a29491d3b6690',
            heartrate: true
        },
        {
            text: 'Polar H10 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/71FiFWJYl7L._AC_SL300_.jpg',
            url: 'https://www.amazon.co.uk/dp/B01NC34XQ9/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1&tag=biketrackin0b-21&linkId=b8db903acff0c8bfaff5e152d14e7e57',
            heartrate: true
        },
        {
            text: 'Bike Phone Holder',
            image: 'https://images-na.ssl-images-amazon.com/images/I/61u6QG2GvAL._AC_SL1500_.jpg',
            url: 'https://www.amazon.co.uk/PEYOU-360%C2%B0Rotation-SmartPhones-Compatible-Accessories/dp/B07TNZ5K7S/ref=as_li_ss_tl?crid=45GWQH177RCO&dchild=1&keywords=smartphone+bike+mount&qid=1596697814&s=sports&sprefix=mount+bike+smar,sports,224&sr=1-14&linkCode=ll1&tag=biketrackin0b-21&linkId=9fc98007d9de830758a4ba3517d6e2e0'
        },
        {
            text: 'Xiaomi Redmi 7A',
            image: 'https://images-na.ssl-images-amazon.com/images/I/61jNSpaAN5L._AC_SL300_.jpg',
            url: 'https://www.amazon.co.uk/dp/B07TB7DJ2J/ref=as_li_ss_tl?dchild=1&keywords=Xiaomi%20Redmi%207a&qid=1596295623&sr=8-1&linkCode=ll1&tag=biketrackin0b-21&linkId=ba7208dc9622a085e2bed0f2e636951c'
        }
    ],
    'US': [
        {
            text: 'Polar H10 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/71ttT1NCxYL._AC_SL300_.jpg',
            url: 'https://www.amazon.com/gp/product/B01NC34XQ9/ref=as_li_tl?ie=UTF8&tag=biketracking-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B01NC34XQ9&linkId=b2a85b9763cdf934c6784beec26a545c',
            heartrate: true
        },
        {
            text: 'Polar H7 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/41eUxIiVtbL._AC_SL300_.jpg',
            url: 'https://www.amazon.com/gp/product/B007S088F4/ref=as_li_tl?ie=UTF8&tag=biketracking-20&camp=1789&creative=9325&linkCode=as2&creativeASIN=B007S088F4&linkId=6f46713893d31b4c0d94f8188cacff95',
            heartrate: true
        },
        {
            text: 'Bike Smartphone Mount',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51qRwcAVGhL._AC_SL300_.jpg',
            url: 'https://www.amazon.com/BOVON-Silicone-Motorcycle-Handlebar-Universal/dp/B07D5SVD7Y/ref=as_li_ss_tl?crid=3IN3B4DC3SE6P&dchild=1&keywords=bike+smartphone+holder&qid=1596276374&sprefix=bike+smartphone+,aps,246&sr=8-5&linkCode=ll1&tag=biketracking-20&linkId=8b3f0409e81401303d44dcdf50c971e7&language=en_US'
        },
        {
            text: 'Xiaomi Redmi 7A',
            image: 'https://images-na.ssl-images-amazon.com/images/I/61jNSpaAN5L._AC_SL300_.jpg',
            url: 'https://www.amazon.com/Xiaomi-Display-Factory-Unlocked-International/dp/B07TB7DJ2J/ref=as_li_ss_tl?dchild=1&keywords=Xiaomi+Redmi+7a&qid=1596295623&sr=8-1&linkCode=ll1&tag=biketracking-20&linkId=7ab951ee8652f3827abef072fdee05dd&language=en_US'
        },
    ],
    'CA': [
        {
            text: 'Polar H9 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51MOepEZrVL._AC_SL300_.jpg',
            url: 'https://images-na.ssl-images-amazon.com/images/I/71FiFWJYl7L._AC_SL1500_.jpg',
            heartrate: true
        },
        {
            text: 'Polar H10 Heart Rate',
            image: 'https://images-na.ssl-images-amazon.com/images/I/71FiFWJYl7L._AC_SL300_.jpg',
            url: 'https://www.amazon.ca/dp/B01NC34XQ9/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1&tag=&linkId=5651d9a6f23d2d4a20f1890393de2a77&language=en_CA',
            heartrate: true
        }
    ]
}

  constructor() {
  }
}
