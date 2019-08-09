import { Component } from '@angular/core';
import { SliderConfigType } from 'projects/ng-un-slider/src/public_api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-universal-slider';

  dataSource: any[] = [{
    src: 'https://geoconnect.ge/Uploads/552/Logo/sdgs.png'
  },
  {
    src: 'https://geoconnect.ge/Uploads/503/Logo/fghdfgh.jpg'
  },
  {
    src: 'https://geoconnect.ge/Uploads/448/Logo/bolotvali(1)-Copy.jpg'
  }, {
    src: 'https://geoconnect.ge/Uploads/503/Logo/fghdfgh.jpg'
  }
  ];
  outputdataSource: any[];

  rSliderConfig: SliderConfigType = {
    interval: 1000,
    cellCount: 3,
    isCircular: true,
    autoplay: false,
    moveCount: 1,
    margin: { position: 'left', size: 50 },
    pagination: {
      show: false
    },
    arrow: {
      position: 'body',
      right: {
        iconClass: '_css_carousel__arrow--right fas fa-angle-right',
        hostClass: '_css_carousel__arrow right_none'
      },
      left: {
        iconClass: '_css_carousel__arrow--left fas fa-angle-left',
        hostClass: '_css_carousel__arrow'
      }
    }
  };
}
