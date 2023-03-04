import { Injectable } from '@angular/core';
import { Tab, AppStatus } from './models/types';
import { BehaviorSubject, Observable } from 'rxjs';
import * as application from '@nativescript/core/application';
const trace = require("trace");

@Injectable({
  providedIn: 'root'
})
export class TabsService {

  private selectedTab: Tab
  private selectedTabSubject = new BehaviorSubject<Tab>(null)

  private appStatus: AppStatus
  private appStatusTabSubject = new BehaviorSubject<AppStatus>(null)

  private openTrackSubject = new BehaviorSubject<string>(null)

  constructor() {
    application.on(application.exitEvent, (args) => {
      trace.write('application.exitEvent exiting',trace.categories.Debug)
      this.appStatusTabSubject.next(AppStatus.EXIT)
      this.stopForegroundService()
    })
    try {
      this.startForegroundService()
    } catch (error) {
      trace.write('application: Foreground Service not supported',trace.categories.Error)      
    } 

    application.on(application.suspendEvent, () => {
      trace.write('application.suspendEvent',trace.categories.Debug)
      this.appStatusTabSubject.next(AppStatus.SUSPEND)
    })
    application.on(application.resumeEvent, () => {
      trace.write('application.resumeEvent',trace.categories.Debug)
      this.appStatusTabSubject.next(AppStatus.RESUME)
    })
    application.on(application.displayedEvent, () => {
      trace.write('application.displayedEvent',trace.categories.Debug)
    })
    application.on(application.lowMemoryEvent, (args) => {
      // For Android applications, args.android is an android activity class.
      trace.write('application.lowMemoryEvent ',trace.categories.Debug)
      this.appStatusTabSubject.next(AppStatus.LOW_MEMORY)
    })
    application.on(application.uncaughtErrorEvent, (args) => {
      trace.write('application.uncaughtErrorEvent ' + args.error,trace.categories.Error)
      this.appStatusTabSubject.next(AppStatus.ERROR)
    })
    this.getAppStatusObserver().subscribe((appStatus: AppStatus) => {
      this.appStatus = appStatus
    })
  
    // if (application.android) {
    //   application.android.on(application.AndroidApplication.activityCreatedEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });

    //   application.android.on(application.AndroidApplication.activityDestroyedEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });

    //   application.android.on(application.AndroidApplication.activityStartedEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });

    //   application.android.on(application.AndroidApplication.activityPausedEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });

    //   application.android.on(application.AndroidApplication.activityResumedEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });

    //   application.android.on(application.AndroidApplication.activityStoppedEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });

    //   application.android.on(application.AndroidApplication.saveActivityStateEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });

    //   application.android.on(application.AndroidApplication.activityResultEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });

    //   application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
    //     trace.write("Event: " + args.eventName + ", Activity: " + args.activity);
    //   });
    // }
  }

  setAppStatusStart(){
    trace.write('application.startEvent',trace.categories.Debug)
    this.appStatusTabSubject.next(AppStatus.START)
  }

  setSelectedTab(selectedTab: Tab): void {
    this.selectedTab = selectedTab
    this.selectedTabSubject.next(selectedTab)
  }

  getSelectedTab(): Tab {
    return this.selectedTab
  }

  getAppStatusTab(): AppStatus {
    return this.appStatus
  }

  isStarted(): boolean {
    return this.appStatus == AppStatus.START
  }

  isAppOpen(): boolean {
    return this.appStatus != AppStatus.SUSPEND
  }

  getSelectedTabObserver(): Observable<Tab> {
    return this.selectedTabSubject.asObservable()
  }

  getAppStatusObserver(): Observable<AppStatus> {
    return this.appStatusTabSubject.asObservable()
  }

  getOpenTrackObserver(): Observable<string> {
    return this.openTrackSubject.asObservable()
  }

  openTrack(trackId:string) {
    this.openTrackSubject.next(trackId)
  }

  private startForegroundService() {
    const context = application.android.context
    const intent = new android.content.Intent()
    intent.setClassName(context, 'org.nativescript.geolocation.ForegroundService')
    context.startForegroundService(intent)
  }

  private stopForegroundService() {
    const context = application.android.context
    const intent = new android.content.Intent()
    intent.setClassName(context, 'org.nativescript.geolocation.ForegroundService')
    context.stopService(intent)
  }

}
