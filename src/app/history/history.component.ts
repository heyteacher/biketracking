import { Component, OnInit } from "@angular/core";
import { StoreService } from "../store.service";
import { BaseTrack } from "../models/BaseTrack";
import { formatDateTimeValue, formatDurationValue, formatNumberValue } from "../utils/format";
import { TabsService } from "../tabs.service";
import { Tab } from "../models/types";
import { EventData } from "tns-core-modules/data/observable";
import { ListPicker } from "tns-core-modules/ui/list-picker";
import { Observable } from "tns-core-modules/data/observable";


@Component({
    selector: "History",
    templateUrl: "./history.component.html",
    styleUrls: ["./history.component.scss"]
})
export class HistoryComponent extends Observable implements OnInit {

    tracks: BaseTrack[]
    years: string[]
    selected: any = {}

    formatDateTimeValue = formatDateTimeValue
    formatDurationValue = formatDurationValue
    formatNumberValue = formatNumberValue

    totalDistance: string
    totalTracks: number

    removeDialogOpen: boolean = false
    
    loading:boolean = false


    constructor(
        private storeService: StoreService,
        private tabService: TabsService) {
        super();
    }

    ngOnInit() {
        this.loading = true;
        this.storeService.getTracksObservable().subscribe(
            (tracks: BaseTrack[]) => {
                if (tracks) {
                    this.tracks = tracks
                    this._calculateYearTotals()
                }
                this.loading = false;
            }
        )
        this.tabService.getSelectedTabObserver().subscribe(async (tab: Tab) => {
            if (tab == Tab.HISTORY && !this.tracks) {
                this.years = await this.storeService.getYears()
                this._loadYear(this.years[0])
            }
        })
    }

    toggleTrackSelection(key) {
        this.selected[key] = this.selected[key] === true ? false : true
    }

    getTrackClass(key) {
        return this.selected[key] === true ? "trackSelected" : ""
    }

    visibleIfSelected() {
        const idx = Object.keys(this.selected).findIndex(key => this.selected[key] === true)
        return idx >= 0 ? 'visible' : 'collapse'
    }

    async removeTracks(result: boolean = null) {
        if (result === null) {
            this.showRemoveDialogOpen()
            return
        }
        if (result === true) {
            await this.storeService.removeTracks(Object.keys(this.selected))
        }
        this.selected = {}
        this.closeRemoveDialogOpen()
    }

    public onSelectedIndexChanged(args: EventData) {
        const picker = <ListPicker>args.object;
        this._loadYear(this.years[picker.selectedIndex])
    }

    showRemoveDialogOpen() {
        this.removeDialogOpen = true;
    }

    closeRemoveDialogOpen() {
        this.removeDialogOpen = false;
    }

    private async _loadYear(year: string) {
        this.loading = true;
        this.tracks = await this.storeService.getTracks(year)
        this.selected = {}
        this._calculateYearTotals()
        this.loading = false;
    }
    private async _calculateYearTotals() {
        this.totalTracks = 0
        this.totalDistance = "0.0 KM"
        if (this.tracks) {
            let totalDistance = 0
            for (const track of this.tracks) {
                totalDistance = totalDistance + track.distance
            }
            this.totalDistance = formatNumberValue(totalDistance) + " KM"
            this.totalTracks = this.tracks.length
        }
        this.notifyPropertyChange('totalTracks', this.totalTracks)
        this.notifyPropertyChange('totalDistance', this.totalDistance)
    }
}