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
    src: 'https://pbs.twimg.com/profile_images/779305023507271681/GJJhYpD2_400x400.jpg'
  },
  {
    src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
  },
  {
    src: 'https://66.media.tumblr.com/8ea10ebd95713f20bb5fcf461e14d001/tumblr_ny9tud4AsH1uocmmao1_400.jpg'
  }, {
    src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
  }
  ];
  outputdataSource: any[];

  rSliderConfig: SliderConfigType = {
    interval: 1000,
    cellCount: 3,
    isCircular: true,
    autoplay: false,
    moveCount: 1,
    keyboard: true,
    margin: { position: 'right', size: 50 },
    pagination: {
      show: false
    },
    arrow: {
      show: true,
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

  constructor() {
    setTimeout(() => {
      this.dataSource = [{
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }
      ];
    }, 1000);
  }
}
