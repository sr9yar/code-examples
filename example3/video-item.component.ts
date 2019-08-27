import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../../environments/environment';
import { ProtectedVideoService } from '../../../shared/services/protected-video.service';
import { Preset } from '../../../../models/preset';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { AuthService } from '../../../../services/auth.service';
import { AssetService } from '../../../core/services/asset.service';


@Component({
  selector: 'app-video-item',
  templateUrl: './video-item.component.html',
  styleUrls: ['./video-item.component.scss'],
  providers: [ ProtectedVideoService ],
})
export class VideoItemComponent implements OnInit, AfterViewInit {

  @Input() item: any;


  public showVideoPreview = false;
  public videoBlob: any;

  private loadingState = 'not_loaded';
  private viewInit = false;

  @ViewChild('previewVideoElem') previewVideoElem: ElementRef;

  private video: HTMLVideoElement;

  public imagePreview: any;
  public videoPreview: any;

  private subs: Subscription;

  private videoPreviewFilename = 'preview_256_144.mp4';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private sanitizer: DomSanitizer,
    private protectedVideoService: ProtectedVideoService,
    private assetService: AssetService
  ) {

  }



  ngOnInit() {
    this.video = this.previewVideoElem.nativeElement;

    if ( typeof this.item.render_job_id !== 'undefined') {
      this.fetchImageBlob( this.item.folder, 0 );
    }

  }



  ngAfterViewInit() {
    this.viewInit = true;
  }



  get routerLink() {
    return this.item.render_job_id ? [ '/catalog', 'history', this.item._id ] : [ '/catalog', 'preview', this.item.slug ] ;
  }




  mouseEnter( $event: any ) {

    if (!this.viewInit) {
      return null;
    }

    this.showVideoPreview = true;
    setTimeout( () => { this.initVideo(); }, 0 );

  }






  mouseLeave( $event: any ) {
    if (!this.viewInit) {
      return null;
    }

    const isPlaying = this.video.currentTime > 0 && !this.video.paused && !this.video.ended  && this.video.readyState > 2;

    if ( isPlaying ) {
      this.video.pause();
    }
    this.showVideoPreview = false;

  }





  initVideo() {

    if ( !this.videoPreview && typeof this.item.render_job_id !== 'undefined' ) {
      if ( !this.subs || this.subs.closed ) {
        this.fetchBlob( this.item.folder );
      }
      return null;
    }

    const loadVideo = () => {

      if (this.loadingState === 'not_loaded') {

      this.video.onloadstart = () => {
        this.loadingState = 'loading';
       };
       this.video.onloadeddata = () => {
        if (this.video.readyState >= 2) {
          this.loadingState = 'loaded';
          this.video.play().catch( err => {
                console.log('err play', err);
              });



        }
       };

       this.video.load();
       }


    };

    if ( this.video ) {

      if ( this.video.readyState === 4 ) {

        const isPlaying = this.video.currentTime > 0 && !this.video.paused && !this.video.ended  && this.video.readyState > 2;

        if ( !isPlaying ) {
          this.video.play().catch( err => {
            this.loadingState = 'not_loaded';
            loadVideo();
          });
        }

      } else {
        loadVideo();

      }


    } else {
      console.log('previewVideoElem was not found');
    }


  }

  showImagePreview(): boolean {

    if ( typeof this.item.render_job_id !== 'undefined') {
      return this.imagePreview ? !!this.imagePreview : false;
    }

    return !!( this.item && this.item.slug );
}


  getImagePreview(): string {

      if ( typeof this.item.render_job_id !== 'undefined') {
        return this.imagePreview ? this.imagePreview : null;
      }


      if ( !this.item ) {
        return null;
      }
      return this.assetService.preview( this.item.slug  );

    }



  getVideoPreview(): string {

      if ( typeof this.item.render_job_id !== 'undefined') {
        return this.videoPreview ? this.videoPreview : null;
      }
    
      if ( !this.item ) {
        return null;
      }
      return this.assetService.preview( this.item.slug, 'video', '144' );
    }
  








  // ------------------------------------------------------------------------------------------------------------------------


  getBlobObservable( url: string ): Observable<SafeUrl> {
    return this.http
        .get( url, { responseType: 'blob' } )
        .pipe(
          map( val => this.sanitizer.bypassSecurityTrustUrl( URL.createObjectURL(val)) )
        );
  }




  fetchImageBlob( renderId?: string, n?: number ) {
    let url: string;

    if ( !n ) {
      n = 0;
    }

    if (renderId) {

      url = `${environment.getApiUrl()}/file/rendered-image/${renderId}/${n}`;

    } else {

      if (this.item && this.item.folder) {
        url = `${environment.getApiUrl()}/file/rendered-image/${this.item.folder}/${n}`;
      } else {
        url = null;
      }

    }



    if (url) {

      this.getBlobObservable(url).subscribe( (res: any) => {
        this.imagePreview = res;
      });

    }

  }




  fetchBlob( renderId?: string ) {

    let url: string;

    if (renderId) {
      url = this._getProtectedUrl( renderId );
    } else {
      url = this.getProtectedUrl();
    }


    if (url) {

      this.subs = this.getBlobObservable(url).subscribe(res => {
        this.videoPreview = res;
        setTimeout( () => {
          this.initVideo();
        }, 0);

      });

    }

  }



  public getProtectedUrl() {
    return this.item ?  this._getProtectedUrl( this.item.folder ) : '';
  }



  private _getProtectedUrl(renderId: string) {
    return renderId ?  environment.getApiUrl() + '/file/rendered-video/' + renderId : '';
  }






  // ------------------------------------------------------------------------------------------------------------------------

  addToFavorites( preset: Preset ) {
    this.http.post<any>( environment.getApiUrl() + '/favorites/add', { user_id: this.auth.id(), preset_id: preset._id  } ).subscribe( res => {
      this.auth.pushToFavorites( res.data );
    });
  }



removeFromFavorites( preset: Preset ) {
  this.http.post<any>( environment.getApiUrl() + '/favorites/remove', { user_id: this.auth.id(), preset_id: preset._id  } ).subscribe( res => {
    this.auth.spliceFromFavorites( res.data.doc );
  });

}



toggleFavorite() {
  if ( this.auth.isInFavorites( this.item )    ) {
    this.removeFromFavorites( this.item );
  } else {
    this.addToFavorites( this.item );
  }
}



isInFavorites(): boolean {
  return this.auth.isInFavorites( this.item );
}



}
