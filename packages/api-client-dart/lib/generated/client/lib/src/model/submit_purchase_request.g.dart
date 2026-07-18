// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'submit_purchase_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SubmitPurchaseRequest extends SubmitPurchaseRequest {
  @override
  final String packageId;
  @override
  final String? customerUserId;
  @override
  final String paymentProofUploadId;

  factory _$SubmitPurchaseRequest([
    void Function(SubmitPurchaseRequestBuilder)? updates,
  ]) => (SubmitPurchaseRequestBuilder()..update(updates))._build();

  _$SubmitPurchaseRequest._({
    required this.packageId,
    this.customerUserId,
    required this.paymentProofUploadId,
  }) : super._();
  @override
  SubmitPurchaseRequest rebuild(
    void Function(SubmitPurchaseRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  SubmitPurchaseRequestBuilder toBuilder() =>
      SubmitPurchaseRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SubmitPurchaseRequest &&
        packageId == other.packageId &&
        customerUserId == other.customerUserId &&
        paymentProofUploadId == other.paymentProofUploadId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, customerUserId.hashCode);
    _$hash = $jc(_$hash, paymentProofUploadId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SubmitPurchaseRequest')
          ..add('packageId', packageId)
          ..add('customerUserId', customerUserId)
          ..add('paymentProofUploadId', paymentProofUploadId))
        .toString();
  }
}

class SubmitPurchaseRequestBuilder
    implements Builder<SubmitPurchaseRequest, SubmitPurchaseRequestBuilder> {
  _$SubmitPurchaseRequest? _$v;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _customerUserId;
  String? get customerUserId => _$this._customerUserId;
  set customerUserId(String? customerUserId) =>
      _$this._customerUserId = customerUserId;

  String? _paymentProofUploadId;
  String? get paymentProofUploadId => _$this._paymentProofUploadId;
  set paymentProofUploadId(String? paymentProofUploadId) =>
      _$this._paymentProofUploadId = paymentProofUploadId;

  SubmitPurchaseRequestBuilder() {
    SubmitPurchaseRequest._defaults(this);
  }

  SubmitPurchaseRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _packageId = $v.packageId;
      _customerUserId = $v.customerUserId;
      _paymentProofUploadId = $v.paymentProofUploadId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SubmitPurchaseRequest other) {
    _$v = other as _$SubmitPurchaseRequest;
  }

  @override
  void update(void Function(SubmitPurchaseRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SubmitPurchaseRequest build() => _build();

  _$SubmitPurchaseRequest _build() {
    final _$result =
        _$v ??
        _$SubmitPurchaseRequest._(
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'SubmitPurchaseRequest',
            'packageId',
          ),
          customerUserId: customerUserId,
          paymentProofUploadId: BuiltValueNullFieldError.checkNotNull(
            paymentProofUploadId,
            r'SubmitPurchaseRequest',
            'paymentProofUploadId',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
