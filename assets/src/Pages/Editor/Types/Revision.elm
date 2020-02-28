module Pages.Editor.Types.Revision exposing (External(..), Id, Revision, default, editorLink, embedLink, localStorageDecoder, localStorageEncoder)

import Ellie.Constants as Constants
import Elm.Compiler as Compiler
import Elm.Package as Package exposing (Package)
import Elm.Version as Version exposing (Version)
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode exposing (Value)


type External
    = Default
    | Remote ( Id, Revision )
    | Example Revision


type alias Id =
    String


type alias Revision =
    { htmlCode : String
    , markupCode : String
    , elmCode : String
    , packages : List Package
    , title : String
    , elmVersion : Version
    }


editorLink : Id -> String
editorLink id =
    Constants.editorBase ++ "/" ++ id


embedLink : Id -> String
embedLink id =
    Constants.embedBase ++ "/" ++ id


localStorageDecoder : Decoder Revision
localStorageDecoder =
    Decode.map6 Revision
        (Decode.field "htmlCode" Decode.string)
        (Decode.field "markupCode" Decode.string)
        (Decode.field "elmCode" Decode.string)
        (Decode.field "packages" (Decode.list Package.decoder))
        (Decode.field "title" Decode.string)
        (Decode.field "elmVersion" Version.decoder)


localStorageEncoder : Revision -> Value
localStorageEncoder revision =
    Encode.object
        [ ( "htmlCode", Encode.string revision.htmlCode )
        , ( "markupCode", Encode.string revision.markupCode )
        , ( "elmCode", Encode.string revision.elmCode )
        , ( "packages", Encode.list Package.encoder revision.packages )
        , ( "title", Encode.string revision.title )
        , ( "elmVersion", Version.encoder revision.elmVersion )
        ]


default : List Package -> Revision
default packages =
    { packages = packages
    , title = ""
    , elmVersion = Compiler.version
    , htmlCode = """<html>
<head>
  <style>
    /* you can style your program here */
  </style>
</head>
<body>
  <main></main>
  <script>
    var app = Elm.Main.init({ node: document.querySelector('main') })
    // you can use ports and stuff here
  </script>
</body>
</html>
"""
    , markupCode = """# Start up

###
# Let's do this

### first
Most of the dice you encounter when playing games of
chance look the same: 6 faces, each of which has a differenr
number of pips, from 1 to 6.
[Image "/media/whatever/die.png"]
[Continue -> next]

### second
[Die6Map 1 2 3 4 5 6]
The same die can also be represented with text:
we'll say this is a **(1,2,3,4,5,6)** die. 
That’s not the only possibility for a six-sided
die!
[Continue -> end]"""
    , elmCode = """module Main exposing (main)

import Browser
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)


type alias Model =
    { count : Int }


initialModel : Model
initialModel =
    { count = 0 }


type Msg
    = Increment
    | Decrement


update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            { model | count = model.count + 1 }

        Decrement ->
            { model | count = model.count - 1 }


view : Model -> Html Msg
view model =
    div []
        [ button [ onClick Increment ] [ text "+1" ]
        , div [] [ text <| String.fromInt model.count ]
        , button [ onClick Decrement ] [ text "-1" ]
        ]


main : Program () Model Msg
main =
    Browser.sandbox
        { init = initialModel
        , view = view
        , update = update
        }
"""
    }
