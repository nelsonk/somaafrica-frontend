SomaAfrica

A highly coveted schools park bridging schools, parents, students and staff

Features

Schools park/database
School website (contact info, fees, gallery, desc etc)
Online Admissions
E-Learning & Exams (offered by Teachers or Schools)
Auto gradings
Student report generation
Student performance patterns tracker
Bursaries
Discussion forum
Social media, email, live chat, SMS
School payment system
Staff & Student database
Inventory management (sick bay, school materials etc)
Student attendence tracker
UNEB database
System reports


## SERVICES

# API service
This is the base service for all http requests, can be accessed directly or via crud service.

It sets some defaults for retry, timeout and bypass adding access token as show below if not explicitly set in call.

retry=3
timeout=30000
bypass=false

These defaults can be overwritten by passing them as one object in your API call as the last argument e.g

{
    retry=3,
    timeout=30000,
    bypass=false
}

# Crud service
Use this service if you want to send https requests and save or remove items to/from session storage.

All gets first attempt fetching from session storage then get from API if API is healthy.

Just like the API service, you pass the defaults overides or what we call the configs together with save_as or remove as one object and as the last argument.

# API Health Service
This checks if API is up and reachable, returning an observable.

# Auth Service
This has an observable to checking if someone is authenticated or not. This also contains all of the API calls logic for User and Person, Role/Group creation and modification, including adding Address, Phone, registration, reset/change password etc

# Navigation Service
Used to track source page while navigating through different pages. Just add the service to the constructor

# Session Storage Service
This is our session storage cache service for add and removing objects to the cache. It logs to console and errors encountered.

# Confirmation service
This is used for any confirmations, can be used in any component.

# Notification service
This is used for any notifications, can be used in any component.

## INTERCEPTORS

# Auth Headers Interceptor

If bypass is not set or set to false, this adds access token to all API requests and also refleshes the access token using refresh token if 401 status code is got.

# Retry Timeout Interceptor
This sets retries and timeout to API requests.

## GUARDS

# Auth Gaurd
This checks if user is authenticated. It is added to routes that required user to be logged in.

# Group Gaurd
This checks if user has a group/role else redirect them to Roles page to choose one. Some of the roles we have at this stage are Ambassador, Teacher, School, Parent/Student.

## DIRECTIVES

# TrackSource Directive
Not currently used, we use NavigationService instead.

# File / Image upload
Use formData to send file to API

# ng-select
This is good for selection fields allowing either single selection or multiple

Install:
npm install --save @ng-select/ng-select

Import in ts:
import { NgSelectComponent } from '@ng-select/ng-select';
imports: [NgSelectComponent]

Use in html:
@case ('multi-select') {
    <ng-select
        [items]="summary.options"
        bindLabel="label"
        [multiple]="true"
        [(ngModel)]="summary.value">
    </ng-select>
}

ng-select css in styles.css

# soma-input
Use this class to style any input in any component, css in styles.css

# FontAwesome icon class
To use FontAwesome classes install package below
`npm install @fortawesome/fontawesome-free`

Add to angular.json
"styles": [
    "node_modules/@fortawesome/fontawesome-free/css/all.min.css"
]

Then you can use classes like this in any component

`<i class="fa-solid fa-toggle-on"></i>`

# Document viewer

install this

`npm install pdfjs-dist`

Annotation service not currently used but could be used to get, delete, create annotations from API

Thumbnail component and service are used to add small previews of document pages on the side and to easily jump to previewed page
