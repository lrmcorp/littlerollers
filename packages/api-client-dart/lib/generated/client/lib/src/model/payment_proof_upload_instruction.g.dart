// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_proof_upload_instruction.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentProofUploadInstruction extends PaymentProofUploadInstruction {
  @override
  final String id;
  @override
  final JsonObject? status;
  @override
  final JsonObject? scanStatus;
  @override
  final String uploadReference;

  factory _$PaymentProofUploadInstruction([
    void Function(PaymentProofUploadInstructionBuilder)? updates,
  ]) => (PaymentProofUploadInstructionBuilder()..update(updates))._build();

  _$PaymentProofUploadInstruction._({
    required this.id,
    this.status,
    this.scanStatus,
    required this.uploadReference,
  }) : super._();
  @override
  PaymentProofUploadInstruction rebuild(
    void Function(PaymentProofUploadInstructionBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentProofUploadInstructionBuilder toBuilder() =>
      PaymentProofUploadInstructionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentProofUploadInstruction &&
        id == other.id &&
        status == other.status &&
        scanStatus == other.scanStatus &&
        uploadReference == other.uploadReference;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, scanStatus.hashCode);
    _$hash = $jc(_$hash, uploadReference.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PaymentProofUploadInstruction')
          ..add('id', id)
          ..add('status', status)
          ..add('scanStatus', scanStatus)
          ..add('uploadReference', uploadReference))
        .toString();
  }
}

class PaymentProofUploadInstructionBuilder
    implements
        Builder<
          PaymentProofUploadInstruction,
          PaymentProofUploadInstructionBuilder
        > {
  _$PaymentProofUploadInstruction? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  JsonObject? _status;
  JsonObject? get status => _$this._status;
  set status(JsonObject? status) => _$this._status = status;

  JsonObject? _scanStatus;
  JsonObject? get scanStatus => _$this._scanStatus;
  set scanStatus(JsonObject? scanStatus) => _$this._scanStatus = scanStatus;

  String? _uploadReference;
  String? get uploadReference => _$this._uploadReference;
  set uploadReference(String? uploadReference) =>
      _$this._uploadReference = uploadReference;

  PaymentProofUploadInstructionBuilder() {
    PaymentProofUploadInstruction._defaults(this);
  }

  PaymentProofUploadInstructionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _scanStatus = $v.scanStatus;
      _uploadReference = $v.uploadReference;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentProofUploadInstruction other) {
    _$v = other as _$PaymentProofUploadInstruction;
  }

  @override
  void update(void Function(PaymentProofUploadInstructionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentProofUploadInstruction build() => _build();

  _$PaymentProofUploadInstruction _build() {
    final _$result =
        _$v ??
        _$PaymentProofUploadInstruction._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PaymentProofUploadInstruction',
            'id',
          ),
          status: status,
          scanStatus: scanStatus,
          uploadReference: BuiltValueNullFieldError.checkNotNull(
            uploadReference,
            r'PaymentProofUploadInstruction',
            'uploadReference',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
