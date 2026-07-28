// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'approve_purchase_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const ApprovePurchaseRequestReasonCodeEnum
_$approvePurchaseRequestReasonCodeEnum_PAYMENT_VERIFIED =
    const ApprovePurchaseRequestReasonCodeEnum._('PAYMENT_VERIFIED');
const ApprovePurchaseRequestReasonCodeEnum
_$approvePurchaseRequestReasonCodeEnum_PROOF_INVALID =
    const ApprovePurchaseRequestReasonCodeEnum._('PROOF_INVALID');
const ApprovePurchaseRequestReasonCodeEnum
_$approvePurchaseRequestReasonCodeEnum_AMOUNT_MISMATCH =
    const ApprovePurchaseRequestReasonCodeEnum._('AMOUNT_MISMATCH');
const ApprovePurchaseRequestReasonCodeEnum
_$approvePurchaseRequestReasonCodeEnum_DUPLICATE_PURCHASE =
    const ApprovePurchaseRequestReasonCodeEnum._('DUPLICATE_PURCHASE');
const ApprovePurchaseRequestReasonCodeEnum
_$approvePurchaseRequestReasonCodeEnum_OTHER_REVIEW_REQUIRED =
    const ApprovePurchaseRequestReasonCodeEnum._('OTHER_REVIEW_REQUIRED');

ApprovePurchaseRequestReasonCodeEnum
_$approvePurchaseRequestReasonCodeEnumValueOf(String name) {
  switch (name) {
    case 'PAYMENT_VERIFIED':
      return _$approvePurchaseRequestReasonCodeEnum_PAYMENT_VERIFIED;
    case 'PROOF_INVALID':
      return _$approvePurchaseRequestReasonCodeEnum_PROOF_INVALID;
    case 'AMOUNT_MISMATCH':
      return _$approvePurchaseRequestReasonCodeEnum_AMOUNT_MISMATCH;
    case 'DUPLICATE_PURCHASE':
      return _$approvePurchaseRequestReasonCodeEnum_DUPLICATE_PURCHASE;
    case 'OTHER_REVIEW_REQUIRED':
      return _$approvePurchaseRequestReasonCodeEnum_OTHER_REVIEW_REQUIRED;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<ApprovePurchaseRequestReasonCodeEnum>
_$approvePurchaseRequestReasonCodeEnumValues =
    BuiltSet<ApprovePurchaseRequestReasonCodeEnum>(
      const <ApprovePurchaseRequestReasonCodeEnum>[
        _$approvePurchaseRequestReasonCodeEnum_PAYMENT_VERIFIED,
        _$approvePurchaseRequestReasonCodeEnum_PROOF_INVALID,
        _$approvePurchaseRequestReasonCodeEnum_AMOUNT_MISMATCH,
        _$approvePurchaseRequestReasonCodeEnum_DUPLICATE_PURCHASE,
        _$approvePurchaseRequestReasonCodeEnum_OTHER_REVIEW_REQUIRED,
      ],
    );

Serializer<ApprovePurchaseRequestReasonCodeEnum>
_$approvePurchaseRequestReasonCodeEnumSerializer =
    _$ApprovePurchaseRequestReasonCodeEnumSerializer();

class _$ApprovePurchaseRequestReasonCodeEnumSerializer
    implements PrimitiveSerializer<ApprovePurchaseRequestReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PAYMENT_VERIFIED': 'PAYMENT_VERIFIED',
    'PROOF_INVALID': 'PROOF_INVALID',
    'AMOUNT_MISMATCH': 'AMOUNT_MISMATCH',
    'DUPLICATE_PURCHASE': 'DUPLICATE_PURCHASE',
    'OTHER_REVIEW_REQUIRED': 'OTHER_REVIEW_REQUIRED',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PAYMENT_VERIFIED': 'PAYMENT_VERIFIED',
    'PROOF_INVALID': 'PROOF_INVALID',
    'AMOUNT_MISMATCH': 'AMOUNT_MISMATCH',
    'DUPLICATE_PURCHASE': 'DUPLICATE_PURCHASE',
    'OTHER_REVIEW_REQUIRED': 'OTHER_REVIEW_REQUIRED',
  };

  @override
  final Iterable<Type> types = const <Type>[
    ApprovePurchaseRequestReasonCodeEnum,
  ];
  @override
  final String wireName = 'ApprovePurchaseRequestReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    ApprovePurchaseRequestReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  ApprovePurchaseRequestReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => ApprovePurchaseRequestReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$ApprovePurchaseRequest extends ApprovePurchaseRequest {
  @override
  final ApprovePurchaseRequestReasonCodeEnum reasonCode;
  @override
  final int expectedVersion;
  @override
  final String? note;

  factory _$ApprovePurchaseRequest([
    void Function(ApprovePurchaseRequestBuilder)? updates,
  ]) => (ApprovePurchaseRequestBuilder()..update(updates))._build();

  _$ApprovePurchaseRequest._({
    required this.reasonCode,
    required this.expectedVersion,
    this.note,
  }) : super._();
  @override
  ApprovePurchaseRequest rebuild(
    void Function(ApprovePurchaseRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ApprovePurchaseRequestBuilder toBuilder() =>
      ApprovePurchaseRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ApprovePurchaseRequest &&
        reasonCode == other.reasonCode &&
        expectedVersion == other.expectedVersion &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ApprovePurchaseRequest')
          ..add('reasonCode', reasonCode)
          ..add('expectedVersion', expectedVersion)
          ..add('note', note))
        .toString();
  }
}

class ApprovePurchaseRequestBuilder
    implements Builder<ApprovePurchaseRequest, ApprovePurchaseRequestBuilder> {
  _$ApprovePurchaseRequest? _$v;

  ApprovePurchaseRequestReasonCodeEnum? _reasonCode;
  ApprovePurchaseRequestReasonCodeEnum? get reasonCode => _$this._reasonCode;
  set reasonCode(ApprovePurchaseRequestReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ApprovePurchaseRequestBuilder() {
    ApprovePurchaseRequest._defaults(this);
  }

  ApprovePurchaseRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reasonCode = $v.reasonCode;
      _expectedVersion = $v.expectedVersion;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ApprovePurchaseRequest other) {
    _$v = other as _$ApprovePurchaseRequest;
  }

  @override
  void update(void Function(ApprovePurchaseRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ApprovePurchaseRequest build() => _build();

  _$ApprovePurchaseRequest _build() {
    final _$result =
        _$v ??
        _$ApprovePurchaseRequest._(
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'ApprovePurchaseRequest',
            'reasonCode',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'ApprovePurchaseRequest',
            'expectedVersion',
          ),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
