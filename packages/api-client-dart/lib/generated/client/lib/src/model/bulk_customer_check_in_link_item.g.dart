// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bulk_customer_check_in_link_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BulkCustomerCheckInLinkItem extends BulkCustomerCheckInLinkItem {
  @override
  final String bookingId;
  @override
  final bool ok;
  @override
  final CustomerCheckInIssue? result;
  @override
  final String? errorCode;

  factory _$BulkCustomerCheckInLinkItem([
    void Function(BulkCustomerCheckInLinkItemBuilder)? updates,
  ]) => (BulkCustomerCheckInLinkItemBuilder()..update(updates))._build();

  _$BulkCustomerCheckInLinkItem._({
    required this.bookingId,
    required this.ok,
    this.result,
    this.errorCode,
  }) : super._();
  @override
  BulkCustomerCheckInLinkItem rebuild(
    void Function(BulkCustomerCheckInLinkItemBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BulkCustomerCheckInLinkItemBuilder toBuilder() =>
      BulkCustomerCheckInLinkItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BulkCustomerCheckInLinkItem &&
        bookingId == other.bookingId &&
        ok == other.ok &&
        result == other.result &&
        errorCode == other.errorCode;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, bookingId.hashCode);
    _$hash = $jc(_$hash, ok.hashCode);
    _$hash = $jc(_$hash, result.hashCode);
    _$hash = $jc(_$hash, errorCode.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BulkCustomerCheckInLinkItem')
          ..add('bookingId', bookingId)
          ..add('ok', ok)
          ..add('result', result)
          ..add('errorCode', errorCode))
        .toString();
  }
}

class BulkCustomerCheckInLinkItemBuilder
    implements
        Builder<
          BulkCustomerCheckInLinkItem,
          BulkCustomerCheckInLinkItemBuilder
        > {
  _$BulkCustomerCheckInLinkItem? _$v;

  String? _bookingId;
  String? get bookingId => _$this._bookingId;
  set bookingId(String? bookingId) => _$this._bookingId = bookingId;

  bool? _ok;
  bool? get ok => _$this._ok;
  set ok(bool? ok) => _$this._ok = ok;

  CustomerCheckInIssueBuilder? _result;
  CustomerCheckInIssueBuilder get result =>
      _$this._result ??= CustomerCheckInIssueBuilder();
  set result(CustomerCheckInIssueBuilder? result) => _$this._result = result;

  String? _errorCode;
  String? get errorCode => _$this._errorCode;
  set errorCode(String? errorCode) => _$this._errorCode = errorCode;

  BulkCustomerCheckInLinkItemBuilder() {
    BulkCustomerCheckInLinkItem._defaults(this);
  }

  BulkCustomerCheckInLinkItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _bookingId = $v.bookingId;
      _ok = $v.ok;
      _result = $v.result?.toBuilder();
      _errorCode = $v.errorCode;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BulkCustomerCheckInLinkItem other) {
    _$v = other as _$BulkCustomerCheckInLinkItem;
  }

  @override
  void update(void Function(BulkCustomerCheckInLinkItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BulkCustomerCheckInLinkItem build() => _build();

  _$BulkCustomerCheckInLinkItem _build() {
    _$BulkCustomerCheckInLinkItem _$result;
    try {
      _$result =
          _$v ??
          _$BulkCustomerCheckInLinkItem._(
            bookingId: BuiltValueNullFieldError.checkNotNull(
              bookingId,
              r'BulkCustomerCheckInLinkItem',
              'bookingId',
            ),
            ok: BuiltValueNullFieldError.checkNotNull(
              ok,
              r'BulkCustomerCheckInLinkItem',
              'ok',
            ),
            result: _result?.build(),
            errorCode: errorCode,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'result';
        _result?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'BulkCustomerCheckInLinkItem',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
