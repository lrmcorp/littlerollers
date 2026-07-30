// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mobile_features.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MobileFeatures extends MobileFeatures {
  @override
  final bool accountRecovery;
  @override
  final bool revokeAllSessions;
  @override
  final bool bookingCancellation;
  @override
  final bool reschedule;
  @override
  final bool customerCheckIn;
  @override
  final bool instructorCheckIn;

  factory _$MobileFeatures([void Function(MobileFeaturesBuilder)? updates]) =>
      (MobileFeaturesBuilder()..update(updates))._build();

  _$MobileFeatures._({
    required this.accountRecovery,
    required this.revokeAllSessions,
    required this.bookingCancellation,
    required this.reschedule,
    required this.customerCheckIn,
    required this.instructorCheckIn,
  }) : super._();
  @override
  MobileFeatures rebuild(void Function(MobileFeaturesBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MobileFeaturesBuilder toBuilder() => MobileFeaturesBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MobileFeatures &&
        accountRecovery == other.accountRecovery &&
        revokeAllSessions == other.revokeAllSessions &&
        bookingCancellation == other.bookingCancellation &&
        reschedule == other.reschedule &&
        customerCheckIn == other.customerCheckIn &&
        instructorCheckIn == other.instructorCheckIn;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, accountRecovery.hashCode);
    _$hash = $jc(_$hash, revokeAllSessions.hashCode);
    _$hash = $jc(_$hash, bookingCancellation.hashCode);
    _$hash = $jc(_$hash, reschedule.hashCode);
    _$hash = $jc(_$hash, customerCheckIn.hashCode);
    _$hash = $jc(_$hash, instructorCheckIn.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MobileFeatures')
          ..add('accountRecovery', accountRecovery)
          ..add('revokeAllSessions', revokeAllSessions)
          ..add('bookingCancellation', bookingCancellation)
          ..add('reschedule', reschedule)
          ..add('customerCheckIn', customerCheckIn)
          ..add('instructorCheckIn', instructorCheckIn))
        .toString();
  }
}

class MobileFeaturesBuilder
    implements Builder<MobileFeatures, MobileFeaturesBuilder> {
  _$MobileFeatures? _$v;

  bool? _accountRecovery;
  bool? get accountRecovery => _$this._accountRecovery;
  set accountRecovery(bool? accountRecovery) =>
      _$this._accountRecovery = accountRecovery;

  bool? _revokeAllSessions;
  bool? get revokeAllSessions => _$this._revokeAllSessions;
  set revokeAllSessions(bool? revokeAllSessions) =>
      _$this._revokeAllSessions = revokeAllSessions;

  bool? _bookingCancellation;
  bool? get bookingCancellation => _$this._bookingCancellation;
  set bookingCancellation(bool? bookingCancellation) =>
      _$this._bookingCancellation = bookingCancellation;

  bool? _reschedule;
  bool? get reschedule => _$this._reschedule;
  set reschedule(bool? reschedule) => _$this._reschedule = reschedule;

  bool? _customerCheckIn;
  bool? get customerCheckIn => _$this._customerCheckIn;
  set customerCheckIn(bool? customerCheckIn) =>
      _$this._customerCheckIn = customerCheckIn;

  bool? _instructorCheckIn;
  bool? get instructorCheckIn => _$this._instructorCheckIn;
  set instructorCheckIn(bool? instructorCheckIn) =>
      _$this._instructorCheckIn = instructorCheckIn;

  MobileFeaturesBuilder() {
    MobileFeatures._defaults(this);
  }

  MobileFeaturesBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _accountRecovery = $v.accountRecovery;
      _revokeAllSessions = $v.revokeAllSessions;
      _bookingCancellation = $v.bookingCancellation;
      _reschedule = $v.reschedule;
      _customerCheckIn = $v.customerCheckIn;
      _instructorCheckIn = $v.instructorCheckIn;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MobileFeatures other) {
    _$v = other as _$MobileFeatures;
  }

  @override
  void update(void Function(MobileFeaturesBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MobileFeatures build() => _build();

  _$MobileFeatures _build() {
    final _$result =
        _$v ??
        _$MobileFeatures._(
          accountRecovery: BuiltValueNullFieldError.checkNotNull(
            accountRecovery,
            r'MobileFeatures',
            'accountRecovery',
          ),
          revokeAllSessions: BuiltValueNullFieldError.checkNotNull(
            revokeAllSessions,
            r'MobileFeatures',
            'revokeAllSessions',
          ),
          bookingCancellation: BuiltValueNullFieldError.checkNotNull(
            bookingCancellation,
            r'MobileFeatures',
            'bookingCancellation',
          ),
          reschedule: BuiltValueNullFieldError.checkNotNull(
            reschedule,
            r'MobileFeatures',
            'reschedule',
          ),
          customerCheckIn: BuiltValueNullFieldError.checkNotNull(
            customerCheckIn,
            r'MobileFeatures',
            'customerCheckIn',
          ),
          instructorCheckIn: BuiltValueNullFieldError.checkNotNull(
            instructorCheckIn,
            r'MobileFeatures',
            'instructorCheckIn',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
