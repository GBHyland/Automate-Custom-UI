# Only linux's envsubst works here, npm's envsub is crap, doesn't replace properly string parts after '#'
substitute_app_config(){
    APP_CONFIG_FILE_PATH=$1;
    DEFAULT_VALUES_FILE_PATH=$2;

    # Replacing values
    echo " \_ File $APP_CONFIG_FILE_PATH:";
        echo -ne "     \_ Replacing values using file: $DEFAULT_VALUES_FILE_PATH ... ";

        export $(cat $DEFAULT_VALUES_FILE_PATH | xargs)

        # This hack should be got ridden of...
        export APP_CONFIG_APPS_DEPLOYED="[]"
        export APP_CONFIG_CUSTOM_MODELED_EXTENSION="{}"

        VARIABLE_NAMES=$(cut -d = -f 1 $DEFAULT_VALUES_FILE_PATH | sed -e 's/^/$/g') || exit 1;
        VARIABLE_NAMES_IN_ONE_LINE=$(echo $VARIABLE_NAMES);
        COMMA_SEPARATED_VARIABLE_NAMES="${VARIABLE_NAMES_IN_ONE_LINE// /,}"

        REPLACED_APP_CONFIG=$(envsubst $COMMA_SEPARATED_VARIABLE_NAMES < "$APP_CONFIG_FILE_PATH") || exit 2;
        echo $REPLACED_APP_CONFIG > "$APP_CONFIG_FILE_PATH" || exit 3;

    app_config_checker $APP_CONFIG_FILE_PATH

    # Format json file
    echo $REPLACED_APP_CONFIG | jq > "$APP_CONFIG_FILE_PATH" || exit 33;
    echo "done";
}

create_war_artefact() {
    DIST_APP_DIR="$1"
    OUTPUT="$2"

    echo " \_ Creating WAR archive"
    jar -cvf "$OUTPUT" -C "$DIST_APP_DIR" . 1> $REPO_ROOT/.tempfile
    sed 's/^/     /' $REPO_ROOT/.tempfile
}

create_zip_artefact() {
    DIST_APP_DIR="$1"
    OUTPUT="$2"
    VERSION="$3"

    echo " \_ Creating ZIP archive"
    cp "$REPO_ROOT/docs/license-info/license-info-$DBP_VERSION.md" "$DIST_APP_DIR/license-info-$VERSION.md";
    cd "$DIST_APP_DIR";
    zip -r -X "$OUTPUT" * 1> $REPO_ROOT/.tempfile
    sed 's/^/     /' $REPO_ROOT/.tempfile
}

create_zip_sha() {
    FILE_PATH="$1"

    echo " \_ Generating SHA1 for zip archive:"
    echo "    $FILE_PATH.sha1"
    shasum $FILE_PATH | cut -d ' ' -f 1 > "$FILE_PATH.sha1"

    echo " \_ Checking generated SHA1 for zip archive:"

    SHA_RECORD="`cat $FILE_PATH.sha1`  `basename $FILE_PATH`"
    cd `dirname $FILE_PATH`
    RESULT=`echo "$SHA_RECORD" | shasum -c -`
    cd $REPO_ROOT

    echo "    $RESULT"
}
