import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { NativeScriptLocalizeModule } from "nativescript-localize/angular";
registerLocaleData(localeEn);

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptHttpClientModule,
        NativeScriptLocalizeModule
    ],
    declarations: [
        AppComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
