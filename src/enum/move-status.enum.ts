export enum MoveStatus {
    waiting = 'waiting',
    pending_checklist = 'pending_checklist',
    pending_move = 'pending_move',
    pending_yardmaster_signature = 'pending_yardmaster_signature',
    done = 'done',
    cancelled = 'cancelled',
    inspection_failed_pending_signature = 'inspection_failed_pending_signature',
    inspection_failed = 'inspection_failed'
}