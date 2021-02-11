import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import * as THREE from 'three/build/three.module.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: [ './home.page.scss' ],
})
export class HomePage implements OnInit {
  public showLoadingSpinner = true;
  constructor(private readonly router: Router) {
  }

  ngOnInit() {

  }

  public startLobby(): void {
    this.router.navigateByUrl('/lobby').then();
  }

  public hideLoader() {
    this.showLoadingSpinner = false;
  }
}


