#!/bin/bash

# function declarations

confirm() {
    if [ "$FORCE" == '-y' ]; then
        true
    else
        read -r -p "$1 [y/N] " response < /dev/tty
        if [[ $response =~ ^(yes|y|Y)$ ]]; then
            true
        else
            false
        fi
    fi
}

prompt() {
        read -r -p "$1 [y/N] " response < /dev/tty
        if [[ $response =~ ^(yes|y|Y)$ ]]; then
            true
        else
            false
        fi
}

success() {
    echo "$(tput setaf 2)$1$(tput sgr0)"
}

warning() {
    echo "$(tput setaf 1)$1$(tput sgr0)"
}

newline() {
    echo ""
}

sudocheck() {
    if [ $(id -u) -ne 0 ]; then
        echo -e "Install must be run as root. Try 'sudo ./$scriptname'\n"
        exit 1
    fi
}

# check for pyinstaller

if command -v pyinstaller > /dev/null; then
    success "PyInstaller found"
elif [ -f ./env/bin/activate ]; then
    warning "PyInstaller was not found but a virtualenv was"
    warning "Could it be that it is not activated?"
    echo "Try 'source ./env/bin/activate && ./build.sh'" && newline
    exit 1
else
    warning "PyInstaller was not found"
    exit 1
fi

# check for flotilla module

if ! python -c "import flotilla" 2>&1 >/dev/null | grep "No module named flotilla"; then
    success "Flotilla module found"
elif [ -f ./env/bin/activate ]; then
    warning "The flotilla module was not found but a virtualenv was"
    warning "Could it be that it is not activated?"
    echo "Try 'source ./env/bin/activate && ./build.sh'" && newline
    exit 1
else
    warning "Flotilla module was not found"
    exit 1
fi

pyinstaller --clean --onefile ./firmware-version.py
rm ../firmware/ &> /dev/null
cp ./dist/firmware-version ../firmware/
success "firmware-version binary created in ./firmware/"

exit 0
