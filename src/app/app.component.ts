import { Component, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, OnInit } from '@angular/core';
import { SliderConfigType } from 'projects/ng-un-slider/src/public_api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {
  title = 'ng-universal-slider';

  dataSource: any[];
  outputdataSource: any[];

  rSliderConfig: SliderConfigType = {
    // interval: 1000,
    cellCount: 3,
    hostClassPriority: 'concat',
    isCircular: true,
    autoplay: false,
    keyboard: true,
    // margin: { position: 'right', size: 50 },
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

  constructor(public cdr: ChangeDetectorRef) {
    // setTimeout(() => {
    //   this.dataSource = [{
    //     src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
    //   }
    //   ];
    //   this.cdr.markForCheck();
    // }, 1000);
  }

  ngAfterViewInit() {
    this.cdr.markForCheck();
  }

  ngOnInit() {
    // this.dataSource = [{
    //   src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
    // }];
    // this.cdr.markForCheck();
    setTimeout(() => {
      const isCircular = true;
      this.rSliderConfig = Object.assign(this.rSliderConfig,
        { isCircular: isCircular, autoplay: false });
      this.dataSource = [{
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }, {
        src: 'https://pbs.twimg.com/profile_images/598236288869748736/OWzRETXp_400x400.jpg'
      }, {
        src: 'https://s4827.pcdn.co/wp-content/uploads/2018/03/black_iPad_wallpapers_6_thumb.jpg'
      }];
      this.cdr.markForCheck();
    }, 1000);
  }


  OnChangeDetection() {
    this.cdr.markForCheck();
  }
}
