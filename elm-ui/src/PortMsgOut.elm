module PortMsgOut exposing (..)

import Json.Encode as JE


type PortMsgOut
    = SetMuteState Bool
    | SetRecordingState Bool
    | SetPlayingState Bool


encodePortMessage : PortMsgOut -> JE.Value
encodePortMessage portMessage =
    case portMessage of
        SetMuteState state ->
            JE.object 
                [ ( "type", JE.string "SetMuteState" )
                , ( "state", JE.bool state ) ]

        SetRecordingState state ->
            JE.object
                [ ( "type", JE.string "SetRecordingState" )
                , ( "state", JE.bool state ) ]

        SetPlayingState state ->
            JE.object
                [ ( "type", JE.string "SetPlayingState" )
                , ( "state", JE.bool state ) ]

