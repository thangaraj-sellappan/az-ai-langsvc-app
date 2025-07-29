# Azure Languge Service
Demonstation of Azure Language Service cababilites using Python libraries and React front end application.

## How to start the application?

## Configuration environement vairables
Modify `.env` file with actual values
```ts
APP_NAME=MyFastAPI
ENV=development
DEBUG=True
AZ_AI_RESOURCE_KEY=
AZ_AI_RESOURCE_ENDPOINT=
```
 
## Setup React client application 
```bash
npm install
npm run dev 
```

## Setup Python server application
Frameworks: `FastAPI`

### Create Phython environment using conda

#### Download and Install Conda
1. Downlad and install miniconda from its official website: https://www.anaconda.com/download/success
2. Refer following commands to setup the Pything virtual environment using conda cli

```bash
conda create --name az-langsvc python=3.8
conda activate az-langsvc
```

### Install requirements
```bash
pip install -r requirements.txt
```

### Run Python server app using following methods
### Option 1: VS Code Setup
1. Press `Ctrl+Shift+P` to open command palate and click `Python: Select Interpreter`
2. Select your conda python virtual environnent `az-langsvc`
3. Open VSCode debugger extention and Run the server application

### Option 2: Run the application using CLI
#### Run following command in the terminal
```bash
uvicorn src.main:app --reload
```