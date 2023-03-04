import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NSEmptyOutletComponent, NativeScriptRouterModule } from "@nativescript/angular";


const routes: Routes = [
    {
        path: "",
        redirectTo: "/(historyTab:history/default//liveTab:live/default//mapTab:map/default//settingsTab:settings/default)",
        pathMatch: "full"
    },

    {
        path: "history",
        component: NSEmptyOutletComponent,
        loadChildren: () => import("~/app/history/history.module").then((m) => m.HistoryModule),
        outlet: "historyTab"
    },
    {
        path: "live",
        component: NSEmptyOutletComponent,
        loadChildren: () => import("~/app/live/live.module").then((m) => m.LiveModule),
        outlet: "liveTab"
    },
    {
        path: "map",
        component: NSEmptyOutletComponent,
        loadChildren: () => import("~/app/map/map.module").then((m) => m.MapModule),
        outlet: "mapTab"
    },
    {
        path: "settings",
        component: NSEmptyOutletComponent,
        loadChildren: () => import("~/app/settings/settings.module").then((m) => m.SettingsModule),
        outlet: "settingsTab"
    }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
