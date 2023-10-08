import { AppModule } from '@stone-js/core'

@AppModule()
export class MyApp {
  constructor ({ app }) {
    this.app = app
  }

  run () {
    console.log('This is my awesome app in:', this.app.getEnvironment())
    return this.app
  }
}