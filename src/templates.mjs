/**
 * Available template list.
 *
 * @param   {Container} container
 * @returns {Object[]}
 */
export default ({ format }) => [
  {
    value: 'basic',
    name: format.green('Basic starter with minimal setup')
  },
  {
    value: 'api',
    name: format.blue('Http API starter, useful to create nano service')
  },
  {
    disabled: true,
    value: 'fullstack',
    name: format.gray('Fullstack starter, useful to create fullstack application(coming soon!)')
  },
  {
    disabled: true,
    value: 'spa-react',
    name: format.gray('React SPA starter, useful to create react single page application(coming soon!)')
  },
  {
    disabled: true,
    value: 'ssr-react',
    name: format.gray('React SSR starter, useful to create react server side rendering application(coming soon!)')
  }
]
