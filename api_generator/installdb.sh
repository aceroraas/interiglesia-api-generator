#!/bin/bash

# Función para generar el MD5
generate_md5() {
    local input="$1"
    echo -n "$input" | md5sum | awk '{print $1}'
}

# Función para generar JWT_SECRET
generate_jwt_secret() {
    echo $(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
}

# Función para generar INSTALL_PASSWORD
generate_install_password() {
    echo $(node -e "console.log(require('crypto').randomBytes(5).toString('hex'))")
}

# Verificar si node está instalado
if ! command -v node &> /dev/null; then
    echo "node no está instalado. Por favor, instala node antes de continuar."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "npm no está instalado. Por favor, instala npm antes de continuar."
    exit 1
fi

# Verificar si el módulo crypto está disponible en node
if ! node -e "require('crypto')" &> /dev/null; then
    echo "El módulo crypto no está disponible en node. Por favor, asegúrate de tener una versión de node que incluya crypto."
    exit 1
fi

# Verificar si se pasaron argumentos
if [ $# -eq 5 ]; then
    USER_DB=$1
    PASSWORD_DB=$2
    NAME_DB=$3
    HOST_DB=$4
    PORT_DB=$5
elif [ $# -eq 4 ]; then
    USER_DB=$1
    PASSWORD_DB=$2
    NAME_DB=$3
    HOST_DB=$4
    PORT_DB="5432"
elif [ $# -eq 3 ]; then
    USER_DB=$1
    PASSWORD_DB=$2
    NAME_DB=$3
    HOST_DB="localhost"
    PORT_DB="5432"
else
    # Solicitar usuario, contraseña, host y puerto
    read -p "Ingrese el usuario de la base de datos: " USER_DB
    read -p "Ingrese la contraseña de la base de datos: " PASSWORD_DB
    read -p "Ingrese el nombre de la base de datos (por defecto: se generará automáticamente): " NAME_DB
    read -p "Ingrese el host de la base de datos (por defecto: localhost): " HOST_DB
    HOST_DB=${HOST_DB:-localhost}
    read -p "Ingrese el puerto de la base de datos (por defecto: 5432): " PORT_DB
    PORT_DB=${PORT_DB:-5432}
fi

# Generar el nombre de la base de datos si no se proporcionó
if [ -z "$NAME_DB" ]; then
    # Obtener el timestamp actual y el nombre del equipo
    TIMESTAMP=$(date +%s)
    HOSTNAME=$(hostname)
    # Generar el MD5
    NAME_DB=$(generate_md5 "${TIMESTAMP}${HOSTNAME}")
fi

# Generar JWT_SECRET
JWT_SECRET=$(generate_jwt_secret)

# Generar INSTALL_PASSWORD
INSTALL_PASSWORD=$(generate_install_password)

# Crear el archivo .env
cat <<EOL > .env
USER_DB=$USER_DB
PASSWORD_DB=$PASSWORD_DB
NAME_DB=$NAME_DB
HOST_DB=$HOST_DB
PORT_DB=$PORT_DB
DATABASE_URL="postgresql://$USER_DB:$PASSWORD_DB@$HOST_DB:$PORT_DB/$NAME_DB?schema=public"
JWT_SECRET=$JWT_SECRET
INSTALL_PASSWORD=$INSTALL_PASSWORD
EOL

echo "Archivo .env creado con éxito."
echo "INSTALL_PASSWORD: $INSTALL_PASSWORD"

# Verificar si Prisma está instalado
if ! npm list -g prisma &> /dev/null; then
    echo "Prisma no está instalado. Instalando Prisma..."
    npm install -g prisma
fi

# Verificar si @prisma/client, express, bcryptjs y jsonwebtoken están instalados
if ! npm list @prisma/client express bcryptjs jsonwebtoken dotenv cors &> /dev/null; then
    echo "Instalando @prisma/client, express, bcryptjs y jsonwebtoken dotenv cors..."
    npm install @prisma/client express bcryptjs jsonwebtoken dotenv cors
fi

# Ejecutar la migración de Prisma
npx prisma migrate dev --name init

# Ejecutar Prisma Studio
npx prisma studio
