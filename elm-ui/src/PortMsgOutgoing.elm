module PortMsgOutgoing exposing (..)

import Json.Encode as JE


type PortMsgOutgoing
    = SetMuteState Bool
    | SetRecordingState Bool
    | SetPlayingState Bool


encodePortMessage : PortMsgOutgoing -> JE.Value
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

