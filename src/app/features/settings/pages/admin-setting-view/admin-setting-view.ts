import { Component } from '@angular/core';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { CardsSkeleton } from "src/app/shared/components/skeletons/cards-skeleton/cards-skeleton";
import { SettingCard } from "../../components/setting-card/setting-card";

@Component({
  selector: 'app-admin-setting-view',
  imports: [TranslatePipe, CardsPageLayout, CardsSkeleton, SettingCard],
  templateUrl: './admin-setting-view.html',
  styleUrl: './admin-setting-view.scss',
})
export class AdminSettingView {

}
