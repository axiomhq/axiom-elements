# axiom-elements

## Contributing to `axiom-elements`

### Install

```shell
npm install
```


### Optional: Configure domain and API Key

If you want to test queries against another Axiom instance, copy `.env-sample` to `.env` and adjust the `API_DOMAIN` and `API_KEY`

By default, storybook uses the Axiom "Play" instance: https://play.axiom.co/axiom-play-qf1k/dashboards


### Develop using Storybook

```shell
npm run storybook
```

Open
http://localhost:6006/


### Build

```shell
npm run build
```


## VS Code Extensions

The following VS Code extensions should be utilized when contributing to `axiom-elements`

## Important

- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
    - Optional: update your settings to require a prettier configuration file to format files.
    - settings.json:
        ```json
        "prettier.requireConfig": true,
        ```

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

## Optional

- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)
- [Close HTML/XML tag](https://marketplace.visualstudio.com/items?itemName=Compulim.compulim-vscode-closetag)
- [indent-rainbow](https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow)
- [Night Owl Theme](https://marketplace.visualstudio.com/items?itemName=sdras.night-owl)
