#!/bin/bash

        # Clonar el repositorio de GitHub
        git clone https://github.com/aceroraas/interiglesia-api-consolidation.git || { echo "Error al clonar el repositorio."; exit 1; }

        # Obtener el nombre del directorio del repositorio clonado
        REPO_DIR=$(basename "https://github.com/aceroraas/interiglesia-api-consolidation.git" .git)

        # Moverse al directorio del proyecto
        cd "${REPO_DIR}" || { echo "Error al cambiar al directorio del proyecto."; exit 1; }
 
        # Variables de entorno
        INSTALL_HASH=39530e32c86c96c7ba99a15a2621cf41
        ENTITY_HASH=a3120d2058
        INSTALL_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjEiLCJlbnRpdHlJZCI6IjEiLCJpYXQiOjE3MjQ5MDA2NjQsImV4cCI6MTcyNDkwNDI2NH0.Ssjicxywa9dnmNDxPp-ttAQqqiEj_GzgAPCSHKygY9Q
        API_URL=http://localhost:3000

        # Crear archivo .env
        echo "INSTALL_HASH=${INSTALL_HASH}" > .env
        echo "ENTITY_HASH=${ENTITY_HASH}" >> .env
        echo "INSTALL_TOKEN=${INSTALL_TOKEN}" >> .env


           curl -X POST "http://localhost:3000/installer/register"             -H "Content-Type: application/json"          -d '{
              "install_hash": "39530e32c86c96c7ba99a15a2621cf41",
            "entity_hash": "a3120d2058",
            "install_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjEiLCJlbnRpdHlJZCI6IjEiLCJpYXQiOjE3MjQ5MDA2NjQsImV4cCI6MTcyNDkwNDI2NH0.Ssjicxywa9dnmNDxPp-ttAQqqiEj_GzgAPCSHKygY9Q"
            }' || { echo "Error al llamar al endpoint."; exit 1; }


        # Ejecutar el script installdb.sh
        ./installdb.sh || { echo "Error al ejecutar installdb.sh."; exit 1; }
   
        echo "Script ejecutado con éxito."