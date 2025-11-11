pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_REPO = 'sulitha/storygame'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/UGSNBandara/StoryGame.git'
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}-backend:latest", "./backend")
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}-frontend:latest", "./frontend")
                }
            }
        }

        stage('Push Images') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        docker.image("${DOCKERHUB_REPO}-backend:latest").push()
                        docker.image("${DOCKERHUB_REPO}-frontend:latest").push()
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Optional: Deploy to a server or update docker-compose
                    sh '''
                        echo "Deployment commands here"
                        # Example: docker-compose pull && docker-compose up -d
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}