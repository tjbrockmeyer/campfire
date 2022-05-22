port module Main exposing (..)

import Browser exposing (Document)
import Element exposing (..)
import Element.Background as Background
import Element.Border as Border
import Element.Events as E
import Html.Attributes as HA
import Json.Encode as JE
import PortMsgIn exposing (decodePortValue)
import PortMsgOut exposing (encodePortMessage)
import Util exposing (ifThenElse)



-- MAIN


main : Program {} Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- PORTS


port sendMessage : JE.Value -> Cmd msg


port receiveMessage : (JE.Value -> msg) -> Sub msg



-- MODEL


type alias Model =
    { muteStatus : Bool
    , recordingStatus : Bool
    , playingStatus : Bool
    , message : String
    }


init : flags -> ( Model, Cmd Msg )
init _ =
    ( { muteStatus = False
      , recordingStatus = False
      , playingStatus = False
      , message = ""
      }
    , Cmd.none
    )



-- UPDATE


type Msg
    = NoOp
    | ToggleMute
    | ToggleRecording
    | TogglePlaying
    | ReceiveMessage JE.Value


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        ToggleMute ->
            ( { model | muteStatus = not model.muteStatus }
            , sendMessage <| encodePortMessage <| PortMsgOut.SetMuteState <| not model.muteStatus
            )

        ToggleRecording ->
            ( { model | recordingStatus = not model.recordingStatus }
            , sendMessage <| encodePortMessage <| PortMsgOut.SetRecordingState <| not model.recordingStatus
            )

        TogglePlaying ->
            ( { model | playingStatus = not model.playingStatus }
            , sendMessage <| encodePortMessage <| PortMsgOut.SetPlayingState <| not model.playingStatus
            )

        ReceiveMessage value ->
            case decodePortValue value of
                PortMsgIn.Message message ->
                    ( { model | message = message }
                    , Cmd.none
                    )

                PortMsgIn.Invalid message ->
                    ( { model | message = message }
                    , Cmd.none
                    )


subscriptions : Model -> Sub Msg
subscriptions _ =
    receiveMessage ReceiveMessage



-- VIEW


view : Model -> Document Msg
view model =
    { title = "Campfire"
    , body = [ layout [ Background.color <| rgb 40 40 60 ] <| myWindow model ]
    }


myWindow : Model -> Element Msg
myWindow model =
    column
        [ spacing 10 ]
        [ text <| "Last Message: " ++ model.message
        , button
            []
            (ifThenElse model.muteStatus "Unmute" "Mute")
            ToggleMute
        , button
            [ Element.htmlAttribute <| HA.disabled model.playingStatus ]
            (ifThenElse model.recordingStatus "Stop Recording" "Record")
            ToggleRecording
        , button
            [ Element.htmlAttribute <| HA.disabled model.recordingStatus ]
            (ifThenElse model.playingStatus "Pause" "Play")
            TogglePlaying
        ]


button : List (Element.Attribute Msg) -> String -> Msg -> Element Msg
button attributes buttonText msg =
    column
        (List.concat
            [ [ E.onClick msg
              , padding 10
              , Background.color <| rgb 50 200 50
              , Element.htmlAttribute <| HA.style "cursor" "pointer"
              , Border.rounded 4
              , Border.color <| rgb 10 10 10
              , Border.width 1
              , Border.solid
              ]
            , attributes
            ]
        )
        [ text buttonText ]
