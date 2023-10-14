import { AppModule } from '@stone-js/core'

@AppModule()
export class MyApp {
  constructor ({ app }) {
    this.context = app
  }

  run () {
    console.log('This is my awesome app in:', this.context.getEnvironment())
    return this
  }
}
