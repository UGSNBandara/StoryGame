pipeline {
    agent any

    // Automatically check GitHub every 2 minutes for new commits
    triggers {
        pollSCM('H/2 * * * *')  // Check every 2 minutes
    }

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_REPO = 'sulitha/storygame'
        DEPLOY_HOST = 'devsuli@localhost'
        DEPLOY_DIR  = '~/storygame-deploy'
        COMPOSE_FILE = 'docker-compose.prod.yml'
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

        stage('Deploy via SSH') {
            steps {
                sh '''
                    ssh -o StrictHostKeyChecking=no ${DEPLOY_HOST} "
                        cd ${DEPLOY_DIR} &&
                        docker compose -f ${COMPOSE_FILE} pull &&
                        docker compose -f ${COMPOSE_FILE} up -d --remove-orphans
                    "
                '''
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f'
        }
        success {
            echo 'Pipeline succeeded!'
            echo '=========================================='
            echo 'To deploy to AWS Production, run:'
            echo 'aws ec2-instance-connect ssh --instance-id i-0a569caabdef1aa2e'
            echo 'cd /home/ec2-user/storygame-deploy'
            echo 'docker-compose -f docker-compose.prod.yml pull'
            echo 'docker-compose -f docker-compose.prod.yml up -d --force-recreate'
            echo '=========================================='
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
