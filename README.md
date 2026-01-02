# Tarefas da Familia

App de tarefas domesticas para a familia com Kanban, pontuacao semanal e calendario.

## Funcionalidades

### Login com Google
- Autenticacao via Google (Firebase Auth)
- Acesso restrito aos emails configurados no `.env.local`

### Perfis da Familia
- **Prin** - Adulto
- **Jon** - Adulto
- **Benicio** - Crianca
- **Louise** - Crianca

### Quadro Kanban
- Duas colunas: "Para Fazer" e "Pronto"
- Arraste as tarefas ou clique no botao de concluir
- Filtro por categoria (Adultos/Criancas)
- Filtro por pessoa
- Confete e som ao completar tarefas!

### Gerenciamento de Tarefas
- Criar tarefas com emoji, titulo e categoria
- Atribuir a uma ou mais pessoas
- Definir recorrencia (nenhuma, diaria, semanal)
- Definir periodo do dia (manha, tarde, noite)
- Editar e excluir tarefas

### Placar Semanal
- Pontuacao por tarefas completadas
- Selecao de semana por mes
- Tratamento de empates com mesma medalha
- Medalhas de ouro, prata e bronze

### Calendario da Familia
- Visualizacao mensal
- Adicionar eventos
- Preparado para integracao com Google Calendar

## Configuracao

### 1. Criar projeto no Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative **Authentication** > **Sign-in method** > **Google**
4. Ative **Firestore Database** em modo de producao
5. Copie as credenciais do projeto em **Project Settings** > **General**

### 2. Configurar regras do Firestore

No Firebase Console, va em **Firestore Database** > **Rules** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Apenas usuarios autenticados podem ler/escrever
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Configurar variaveis de ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Emails permitidos (separados por virgula)
NEXT_PUBLIC_ALLOWED_EMAILS=email1@gmail.com,email2@gmail.com
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Executar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 6. Build para producao

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
src/
├── app/                    # Rotas do Next.js
│   ├── page.tsx           # Login
│   ├── select-profile/    # Selecao de perfil
│   ├── board/             # Kanban
│   ├── tarefas/           # Gerenciamento
│   ├── pontuacao/         # Placar
│   └── calendario/        # Calendario
├── components/            # Componentes React
├── contexts/              # Contexts (Auth, Profile)
├── hooks/                 # Custom hooks
├── lib/                   # Firebase, Firestore
└── types/                 # Tipos TypeScript
```

## Tecnologias

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estatica
- **Firebase** - Auth + Firestore
- **Tailwind CSS** - Estilizacao
- **DnD Kit** - Drag and drop
- **canvas-confetti** - Animacoes
- **Howler.js** - Sons

## Deploy

### Vercel (Recomendado)

1. Faca push do codigo para o GitHub
2. Conecte o repositorio no [Vercel](https://vercel.com)
3. Configure as variaveis de ambiente
4. Deploy automatico!

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Uso

### Primeiro Acesso
1. Faca login com uma conta Google autorizada
2. Selecione seu perfil
3. Comece a criar e completar tarefas!

### Criar Tarefa
1. Clique em "Nova Tarefa" no Kanban ou va em "Tarefas"
2. Escolha um emoji
3. Digite o titulo
4. Selecione a categoria (Adulto/Crianca)
5. Atribua a uma ou mais pessoas
6. Defina recorrencia se necessario
7. Escolha o periodo do dia

### Completar Tarefa
- **Arrastar**: Mova o card para a coluna "Pronto"
- **Botao**: Clique no botao verde de check

### Ver Pontuacao
1. Acesse "Placar" no menu
2. Navegue entre semanas e meses
3. Veja quem esta ganhando!

## Licenca

MIT
